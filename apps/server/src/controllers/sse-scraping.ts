import crypto from "crypto";
import type { Request, Response } from "express";
import {
  EVENTS,
  LIST_TYPE,
  TASK_STATUS,
  type listType,
} from "../constants/result_scraping";
import { getListOfRollNos, scrapeAndSaveResult } from "../lib/result_utils";
import { sleep } from "../lib/utils";
import type { taskDataType } from "../models/log-result_scraping";
import { ResultScrapingLog } from "../models/log-result_scraping";
import dbConnect from "../utils/dbConnect";

const BATCH_SIZE = 10;
const MAX_ERRORS = 1000;
const LOCK_TTL_MS = 60_000; // 1 minute lock TTL; heartbeat renews it
const HEARTBEAT_INTERVAL_MS = 25_000; // renew every 25s

// ---------------- helpers ----------------
const sendEvent = (
  res: Response,
  event: string,
  payload: { data: taskDataType | null; error?: string | null }
) => {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  } catch {
    /* ignore write errors — client might be gone */
  }
};

const activeSSEConnections = new Map<string, Response>();

const normalizeIp = (req: Request): string | null => {
  const raw = req.headers["x-forwarded-for"];
  if (typeof raw === "string") return raw.split(",")[0].trim();
  if (Array.isArray(raw)) return raw[0];
  return req.socket.remoteAddress ?? null;
};

const checkAndRegisterSSE = (ip: string, res: Response): boolean => {
  if (activeSSEConnections.has(ip)) return false;
  activeSSEConnections.set(ip, res);
  res.once("close", () => {
    activeSSEConnections.delete(ip);
  });
  return true;
};

const isValidActionType = (
  actionType: string
): actionType is (typeof EVENTS)[keyof typeof EVENTS] =>
  Object.values(EVENTS).includes(
    actionType as (typeof EVENTS)[keyof typeof EVENTS]
  );

const isValidListType = (lt: string): lt is listType =>
  Object.values(LIST_TYPE).includes(lt as listType);

// ---------------- handler ----------------

export async function resultScrapingSSEHandler(
  req: Request,
  res: Response
) {
  const list_type = (req.query.list_type as string) || LIST_TYPE.BACKLOG;
  const actionType = req.query.action as string | undefined;
  const task_resume_id = req.query.task_resume_id as string | undefined;

  if (!actionType || !isValidActionType(actionType)) {
    return res.status(400).json({ data: null, error: "Invalid action type" });
  }

  await dbConnect();

  // ---------- simple non-SSE endpoints ----------
  if (actionType === EVENTS.TASK_GET_LIST) {
    const tasks = await ResultScrapingLog.find({}).sort({ startTime: -1 });
    return res.status(200).json({ data: tasks, error: null });
  }

  if (actionType === EVENTS.TASK_CLEAR_ALL) {
    await ResultScrapingLog.deleteMany({});
    return res.status(200).json({ data: [], error: null });
  }

  if (actionType === EVENTS.TASK_DELETE) {
    if (!req.query.deleteTaskId) return res.status(400).send("Task ID required");
    await ResultScrapingLog.deleteOne({ _id: req.query.deleteTaskId as string });
    return res.status(200).json({ data: [], error: null });
  }

  // ---------- SSE registration ----------
  const ip = normalizeIp(req);
  if (!ip) return res.status(400).send("IP not found");

  if (!checkAndRegisterSSE(ip, res)) {
    return res.status(429).end("SSE already active from this IP");
  }

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  // Worker identity for locking
  const WORKER_ID = `${process.pid}:${crypto.randomUUID()}`;

  // This in-memory taskData is only for SSE / local reflections.
  // Source-of-truth is DB.
  let taskData: taskDataType = {
    processable: 0,
    processed: 0,
    failed: 0,
    success: 0,
    data: [],
    startTime: new Date(),
    endTime: null,
    status: TASK_STATUS.SCRAPING,
    successfulRollNos: [],
    failedRollNos: [],
    queue: [],
    list_type,
    taskId: "",
    // deliberately DO NOT set _id here (avoid passing empty _id to mongoose create)
  } as any;

  let mongoTaskId: string | null = null;
  let isConnectionAlive = true;
  let heartbeatHandle: NodeJS.Timeout | null = null;

  // Cleanup helper
  const cleanup = async () => {
    activeSSEConnections.delete(ip);
    if (heartbeatHandle) clearInterval(heartbeatHandle);
    // release lock if owned
    if (mongoTaskId) {
      await ResultScrapingLog.updateOne(
        { _id: mongoTaskId, lockedBy: WORKER_ID },
        {
          $set: { lockedBy: null, lockExpiresAt: null },
        }
      ).catch(() => {});
    }
  };

  // single close handler
  req.once("close", async () => {
    if (!isConnectionAlive) return;
    isConnectionAlive = false;
    taskData.status = TASK_STATUS.CANCELLED;
    taskData.endTime = new Date();

    if (mongoTaskId) {
      await ResultScrapingLog.updateOne(
        { _id: mongoTaskId },
        {
          $set: {
            status: TASK_STATUS.CANCELLED,
            endTime: taskData.endTime,
          },
        }
      ).catch(() => {});
    }

    try {
      res.end();
    } catch {}
    await cleanup();
  });

  // keep-alive comments for proxies
  const keepAlive = setInterval(() => {
    if (!isConnectionAlive) return clearInterval(keepAlive);
    try {
      res.write(":\n\n");
    } catch {}
  }, 15_000);

  // ---------- Prepare roll list (fresh or resume/retry) ----------
  let roll_list = new Set<string>();
  try {
    if (
      actionType === EVENTS.TASK_RETRY_FAILED ||
      actionType === EVENTS.TASK_PAUSED_RESUME
    ) {
      if (!task_resume_id) {
        await cleanup();
        return res.status(400).send("Task ID required");
      }

      const task = await ResultScrapingLog.findById(task_resume_id).lean();
      if (!task) {
        await cleanup();
        return res.status(200).json({ data: null, error: "Task not found" });
      }

      // copy db doc shape into taskData for SSE (but do not include _id)
      taskData = { ...(task as any) };
      mongoTaskId = String((task as any)._id);

      taskData.endTime = null;
      taskData.status = TASK_STATUS.SCRAPING;

      if (actionType === EVENTS.TASK_PAUSED_RESUME) {
        roll_list = new Set(taskData.queue || []);
        taskData.processable = (taskData.processed || 0) + roll_list.size;
      } else {
        roll_list = new Set(taskData.failedRollNos || []);
        taskData.processable = roll_list.size;
      }

      if (roll_list.size === 0) {
        await cleanup();
        return res
          .status(200)
          .json({ data: null, error: "No roll numbers to process" });
      }
    } else if (actionType === EVENTS.STREAM_SCRAPING) {
      if (!isValidListType(list_type)) {
        await cleanup();
        return res
          .status(200)
          .json({ data: null, error: "Invalid list type provided" });
      }

      roll_list = await getListOfRollNos(list_type);
      if (!roll_list || roll_list.size === 0) {
        await cleanup();
        return res
          .status(200)
          .json({ data: null, error: "No roll numbers found for list type" });
      }

      taskData.processable = roll_list.size;
      taskData.queue = Array.from(roll_list);
      taskData.startTime = new Date();
      // ensure a meaningful taskId is set (required by schema)
      taskData.taskId = `result_scraping:${list_type}:${Date.now()}`;

      // create DB doc — DO NOT include _id field in create payload
      const { _id, ...toCreate } = taskData as any;
      const created = await ResultScrapingLog.create(toCreate);
      mongoTaskId = created._id.toString();
      // refresh in-memory taskData from DB
      taskData = (await ResultScrapingLog.findById(mongoTaskId).lean()) as any;
    }

    // send initial status to client
    sendEvent(res, "task_status", { data: taskData, error: null });

    // ---------- Acquire lock (single worker) ----------
    if (!mongoTaskId) {
      await cleanup();
      return res
        .status(500)
        .json({ data: null, error: "Internal: missing task id" });
    }

    const lockAcquire = await ResultScrapingLog.findOneAndUpdate(
      {
        _id: mongoTaskId,
        $or: [{ lockedBy: null }, { lockExpiresAt: { $lt: new Date() } }],
      },
      {
        $set: {
          lockedBy: WORKER_ID,
          lockExpiresAt: new Date(Date.now() + LOCK_TTL_MS),
          status: TASK_STATUS.SCRAPING,
          lastHeartbeat: new Date(),
        },
      },
      { new: true, useFindAndModify: false }
    ).lean();

    if (!lockAcquire) {
      await cleanup();
      return res
        .status(409)
        .json({ data: null, error: "Task is already being processed" });
    }

    // heartbeat renewer (to detect stale workers)
    heartbeatHandle = setInterval(async () => {
      try {
        await ResultScrapingLog.updateOne(
          { _id: mongoTaskId, lockedBy: WORKER_ID },
          {
            $set: {
              lockExpiresAt: new Date(Date.now() + LOCK_TTL_MS),
              lastHeartbeat: new Date(),
            },
          }
        );
      } catch {
        // ignore
      }
    }, HEARTBEAT_INTERVAL_MS);

    // ---------- Processing loop ----------
    // Use DB queue as source-of-truth: get current queue snapshot
    const dbTask = (await ResultScrapingLog.findById(mongoTaskId).lean()) as any;
    const queueSet = new Set<string>(dbTask?.queue ?? Array.from(roll_list));
    const rollArray = Array.from(queueSet);

    for (let i = 0; i < rollArray.length; i += BATCH_SIZE) {
      if (!isConnectionAlive) break;

      // renew lock before batch
      await ResultScrapingLog.updateOne(
        { _id: mongoTaskId, lockedBy: WORKER_ID },
        {
          $set: { lockExpiresAt: new Date(Date.now() + LOCK_TTL_MS), lastHeartbeat: new Date() },
        }
      );

      const batch = rollArray.slice(i, i + BATCH_SIZE);

      // run in parallel within batch
      const results = await Promise.allSettled(batch.map((r) => scrapeAndSaveResult(r)));

      for (let idx = 0; idx < results.length; idx++) {
        if (!isConnectionAlive) break;

        const result = results[idx];
        const rollNo = batch[idx];

        // Idempotency check: skip if already recorded as success
        const already = await ResultScrapingLog.exists({
          _id: mongoTaskId,
          successfulRollNos: rollNo,
        });

        if (already) {
          // ensure queue does not contain it
          await ResultScrapingLog.updateOne(
            { _id: mongoTaskId },
            { $pull: { queue: rollNo } }
          ).catch(() => {});
          continue;
        }

        const ok =
          result.status === "fulfilled" &&
          result.value &&
          typeof result.value.success === "boolean" &&
          result.value.success === true;

        if (ok) {
          // atomic success update
          await ResultScrapingLog.updateOne(
            { _id: mongoTaskId },
            {
              $inc: { processed: 1, success: 1 },
              $pull: { queue: rollNo, failedRollNos: rollNo },
              $push: { successfulRollNos: rollNo },
            }
          );

          // update in-memory snapshot for SSE
          taskData.processed = (taskData.processed || 0) + 1;
          taskData.success = (taskData.success || 0) + 1;
          taskData.successfulRollNos = (taskData.successfulRollNos || []).concat(rollNo);
          taskData.failedRollNos = (taskData.failedRollNos || []).filter((r) => r !== rollNo);
        } else {
          const reason =
            result.status === "fulfilled"
              ? result.value?.error ?? "Unknown error"
              : String(result.reason ?? "Unknown error");

          const errorEntry = { roll_no: rollNo, reason };

          // atomic failure update (and cap details array)
          const pushObj: any = { failedRollNos: rollNo };
          if ((taskData.data?.length || 0) < MAX_ERRORS) pushObj["data"] = errorEntry;

          await ResultScrapingLog.updateOne(
            { _id: mongoTaskId },
            {
              $inc: { processed: 1, failed: 1 },
              $pull: { queue: rollNo },
              $push: pushObj,
            }
          );

          // update in-memory snapshot for SSE
          taskData.processed = (taskData.processed || 0) + 1;
          taskData.failed = (taskData.failed || 0) + 1;
          taskData.failedRollNos = (taskData.failedRollNos || []).concat(rollNo);
          if ((taskData.data?.length || 0) < MAX_ERRORS) {
            taskData.data = (taskData.data || []).concat(errorEntry);
          }
        }
      } // end inner batch loop

      // refresh taskData.queue from DB (authoritative)
      const refreshed = (await ResultScrapingLog.findById(mongoTaskId).lean()) as any;
      taskData.queue = refreshed?.queue ?? Array.from(queueSet);

      // heartbeat / progress update in DB (lightweight)
      await ResultScrapingLog.updateOne(
        { _id: mongoTaskId, lockedBy: WORKER_ID },
        { $set: { lastHeartbeat: new Date(), status: TASK_STATUS.SCRAPING } }
      ).catch(() => {});

      // send SSE update
      sendEvent(res, "task_status", { data: taskData, error: null });

      // small throttle
      await sleep(1000);
    } // end batches

    // finalization: only the lock owner finalizes
    if (isConnectionAlive) {
      taskData.status = TASK_STATUS.COMPLETED;
      taskData.endTime = new Date();

      // final atomic update: mark completed and release lock
      await ResultScrapingLog.updateOne(
        { _id: mongoTaskId, lockedBy: WORKER_ID },
        {
          $set: {
            status: TASK_STATUS.COMPLETED,
            endTime: taskData.endTime,
            lockedBy: null,
            lockExpiresAt: null,
            lastHeartbeat: new Date(),
          },
        }
      ).catch(() => {});

      sendEvent(res, "task_status", { data: taskData, error: null });
      try {
        res.end();
      } catch {}
    }
  } catch (err) {
    console.error("SSE handler error:", err);
    try {
      // best-effort: mark task as failed/cancelled
      if (mongoTaskId) {
        await ResultScrapingLog.updateOne(
          { _id: mongoTaskId, lockedBy: WORKER_ID },
          {
            $set: {
              status: TASK_STATUS.CANCELLED,
              endTime: new Date(),
              lockedBy: null,
              lockExpiresAt: null,
            },
          }
        ).catch(() => {});
      }
    } catch {}
    try {
      res.status(500).send("Internal Server Error");
    } catch {}
  } finally {
    // cleanup intervals / locks
    if (heartbeatHandle) clearInterval(heartbeatHandle);
    clearInterval(keepAlive);
    await cleanup();
  }
}

// ---------------- placeholder V2 ----------------
export async function resultScrapingSSEHandlerV2(
  req: Request,
  res: Response
) {
  const list = await getListOfRollNos(LIST_TYPE.NEW_BATCH);
  res.status(200).json({ data: Array.from(list), error: null });
}
