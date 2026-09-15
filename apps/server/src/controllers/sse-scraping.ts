import crypto from "node:crypto";
import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import {
  EVENTS,
  LIST_TYPE,
  TASK_STATUS,
  type listType,
} from "../constants/result_scraping";
import { getListOfRollNos, scrapeAndSaveResult } from "../lib/result_utils";
import { sleep } from "../lib/utils";
import {
  type IResultScrapingLog,
  ResultScrapingLog,
  type taskDataType,
} from "../models/log-result_scraping";
import dbConnect from "../utils/dbConnect";
import { clientKey } from "../utils/rate-limit";

// Lower batch size ensures we send updates more frequently to keep connection alive
const BATCH_SIZE = 5;
const MAX_ERRORS = 1000;
// Tighter lock window so users can retry faster if the server crashes hard
const LOCK_TTL_MS = 30_000;
const HEARTBEAT_INTERVAL_MS = 10_000;
const KEEP_ALIVE_INTERVAL_MS = 10_000;

type FlushableResponse = Response & { flush?: () => void };

const sendEvent = (
  res: Response,
  event: string,
  payload: { data: taskDataType | null; error?: string | null }
) => {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    (res as FlushableResponse).flush?.();
  } catch {
    // client disconnected
  }
};

const sendKeepAlive = (res: Response) => {
  try {
    res.write(": keep-alive\n\n");
    (res as FlushableResponse).flush?.();
  } catch {}
};

const activeSSEConnections = new Map<string, Response>();

/** Errors whose message is written for the admin; anything else is reported generically. */
class TaskError extends Error {}

// Express parses `?id[$ne]=x` into an object, so query params must be checked to be plain strings.
const queryString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

type Stream = {
  res: Response;
  workerId: string;
  taskId: string | null;
  alive: boolean;
};

/** Handles the non-streaming actions. Returns false when the action opens a stream. */
async function handleQuickAction(
  req: Request,
  res: Response,
  actionType: string
): Promise<boolean> {
  if (actionType === EVENTS.TASK_GET_LIST) {
    const tasks = await ResultScrapingLog.find({})
      .sort({ startTime: -1 })
      .limit(20);
    res.status(200).json({ data: tasks, error: null });
    return true;
  }
  if (actionType === EVENTS.TASK_CLEAR_ALL) {
    await ResultScrapingLog.deleteMany({});
    res.status(200).json({ data: [], error: null });
    return true;
  }
  if (actionType === EVENTS.TASK_DELETE) {
    const deleteTaskId = queryString(req.query.deleteTaskId);
    if (!deleteTaskId || !isValidObjectId(deleteTaskId)) {
      res
        .status(400)
        .json({ data: null, error: "A valid task id is required" });
      return true;
    }
    await ResultScrapingLog.deleteOne({ _id: deleteTaskId });
    res.status(200).json({ data: [], error: null });
    return true;
  }
  return false;
}

function lockTimestamps() {
  const now = Date.now();
  return {
    lockExpiresAt: new Date(now + LOCK_TTL_MS),
    lastHeartbeat: new Date(now),
  };
}

async function acquireLock(taskId: string, workerId: string) {
  return ResultScrapingLog.findOneAndUpdate<IResultScrapingLog>(
    {
      _id: taskId,
      $or: [
        { lockedBy: null },
        { lockedBy: workerId },
        { lockExpiresAt: { $lt: new Date() } },
      ],
    },
    {
      $set: {
        ...lockTimestamps(),
        lockedBy: workerId,
        status: TASK_STATUS.SCRAPING,
      },
    },
    { new: true }
  ).lean();
}

type Initialized = { taskData: taskDataType; rollQueue: string[] } | null;

/** Loads a paused or failed task and locks it before touching its queue. Null when locked elsewhere. */
async function resumeTask(
  stream: Stream,
  actionType: string,
  taskResumeId: string | undefined
): Promise<Initialized> {
  if (!taskResumeId) throw new TaskError("Task ID missing for resume");
  const exists = await ResultScrapingLog.exists({ _id: taskResumeId });
  if (!exists) throw new TaskError("Task not found");
  stream.taskId = taskResumeId;

  let locked = await acquireLock(taskResumeId, stream.workerId);
  if (!locked) return null;

  if (actionType === EVENTS.TASK_RETRY_FAILED) {
    locked = await ResultScrapingLog.findOneAndUpdate<IResultScrapingLog>(
      { _id: taskResumeId, lockedBy: stream.workerId },
      { $set: { failedRollNos: [], queue: locked.failedRollNos ?? [] } },
      { new: true }
    ).lean();
    if (!locked) return null;
  }

  const { lockedBy, lockExpiresAt, lastHeartbeat, ...task } = locked;
  const taskData = {
    ...task,
    _id: String(locked._id),
    status: TASK_STATUS.SCRAPING,
    endTime: null,
  } as taskDataType;
  return { taskData, rollQueue: taskData.queue ?? [] };
}

async function createTask(
  stream: Stream,
  list_type: string
): Promise<Initialized> {
  const rollQueue = Array.from(await getListOfRollNos(list_type as listType));
  if (rollQueue.length === 0) throw new TaskError("No roll numbers found");

  const newTask = {
    list_type,
    taskId: `scrape:${list_type}:${Date.now()}`,
    status: TASK_STATUS.SCRAPING,
    startTime: new Date(),
    processable: rollQueue.length,
    processed: 0,
    success: 0,
    failed: 0,
    queue: rollQueue,
    successfulRollNos: [],
    failedRollNos: [],
    data: [],
  };
  // Created already locked, so no other worker can pick it up in between.
  const created = await ResultScrapingLog.create({
    ...newTask,
    ...lockTimestamps(),
    lockedBy: stream.workerId,
  });
  stream.taskId = created._id.toString();
  const taskData = {
    ...newTask,
    _id: stream.taskId,
    endTime: null,
  } as taskDataType;
  return { taskData, rollQueue };
}

async function recordOutcome(
  taskId: string,
  rollNo: string,
  outcome: PromiseSettledResult<Awaited<ReturnType<typeof scrapeAndSaveResult>>>
): Promise<boolean> {
  const isSuccess = outcome.status === "fulfilled" && outcome.value?.success;
  if (isSuccess) {
    await ResultScrapingLog.updateOne(
      { _id: taskId },
      {
        $inc: { processed: 1, success: 1 },
        $pull: { queue: rollNo },
        $addToSet: { successfulRollNos: rollNo },
      }
    );
    return true;
  }
  const reason =
    outcome.status === "rejected"
      ? String(outcome.reason)
      : outcome.value?.error || "Unknown error";
  await ResultScrapingLog.updateOne(
    { _id: taskId },
    {
      $inc: { processed: 1, failed: 1 },
      $pull: { queue: rollNo },
      $addToSet: { failedRollNos: rollNo },
      $push: {
        data: {
          $each: [{ roll_no: rollNo, reason }],
          $slice: -MAX_ERRORS,
        },
      },
    }
  );
  return false;
}

async function processQueue(
  stream: Stream,
  taskId: string,
  taskData: taskDataType,
  rollQueue: string[]
) {
  for (let i = 0; i < rollQueue.length; i += BATCH_SIZE) {
    if (!stream.alive) break;

    const batch = rollQueue.slice(i, i + BATCH_SIZE);
    const outcomes = await Promise.allSettled(
      batch.map((roll) => scrapeAndSaveResult(roll))
    );

    for (let j = 0; j < outcomes.length; j++) {
      if (await recordOutcome(taskId, batch[j], outcomes[j])) {
        taskData.success++;
      } else {
        taskData.failed++;
      }
      taskData.processed++;
      // A tick per item keeps proxies from timing out while a slow batch runs.
      sendKeepAlive(stream.res);
    }

    taskData.queue = rollQueue.slice(i + BATCH_SIZE);
    sendEvent(stream.res, "task_status", { data: taskData, error: null });
    await sleep(500);
  }
}

export async function resultScrapingSSEHandler(req: Request, res: Response) {
  const list_type = queryString(req.query.list_type) || LIST_TYPE.BACKLOG;
  const actionType = queryString(req.query.action);
  const task_resume_id = queryString(req.query.task_resume_id);

  if (
    !actionType ||
    !Object.values(EVENTS).includes(
      actionType as (typeof EVENTS)[keyof typeof EVENTS]
    )
  ) {
    return res.status(400).json({ data: null, error: "Invalid action type" });
  }
  if (task_resume_id !== undefined && !isValidObjectId(task_resume_id)) {
    return res.status(400).json({ data: null, error: "Invalid task id" });
  }

  try {
    await dbConnect();
    if (await handleQuickAction(req, res, actionType)) return;
  } catch (err) {
    console.error("Scrape task action failed:", err);
    return res
      .status(500)
      .json({ data: null, error: "The scrape task store is unavailable" });
  }

  const client = clientKey(req);
  if (!client) return res.status(400).send("IP identification failed");

  // One stream per client, so a second tab can't run a parallel scrape.
  if (activeSSEConnections.has(client)) {
    return res
      .status(429)
      .json({ error: "Connection limit reached. Close other tabs." });
  }
  activeSSEConnections.set(client, res);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Disable Nginx buffering
  });
  res.write("\n");

  const stream: Stream = {
    res,
    workerId: `${process.pid}:${crypto.randomUUID()}`,
    taskId: null,
    alive: true,
  };
  let heartbeatHandle: NodeJS.Timeout | null = null;

  // Runs on disconnect and again in finally, so a task created after an early disconnect is released.
  const cleanup = async () => {
    stream.alive = false;
    if (heartbeatHandle) clearInterval(heartbeatHandle);
    // A newer stream from the same client may already hold the slot.
    if (activeSSEConnections.get(client) === res) {
      activeSSEConnections.delete(client);
    }
    if (!stream.taskId) return;
    // Only matches while we still hold the lock, so a completed task is left alone.
    await ResultScrapingLog.updateOne(
      { _id: stream.taskId, lockedBy: stream.workerId },
      {
        $set: {
          lockedBy: null,
          lockExpiresAt: null,
          status: TASK_STATUS.CANCELLED,
        },
      }
    ).catch(console.error);
  };

  // res "close" fires on client disconnect; req "close" can fire as soon as the body is read.
  res.on("close", cleanup);

  const keepAliveLoop = setInterval(() => {
    if (!stream.alive) {
      clearInterval(keepAliveLoop);
      return;
    }
    sendKeepAlive(res);
  }, KEEP_ALIVE_INTERVAL_MS);

  try {
    let initialized: Initialized;
    if (
      actionType === EVENTS.TASK_PAUSED_RESUME ||
      actionType === EVENTS.TASK_RETRY_FAILED
    ) {
      initialized = await resumeTask(stream, actionType, task_resume_id);
    } else if (actionType === EVENTS.STREAM_SCRAPING) {
      initialized = await createTask(stream, list_type);
    } else {
      throw new TaskError("Initialization failed");
    }

    if (!initialized) {
      sendEvent(res, "error", {
        data: null,
        error: "Task is locked by another worker. Please wait.",
      });
      res.end();
      return;
    }
    const taskId = stream.taskId;
    if (!taskId) throw new TaskError("Initialization failed");
    const { taskData, rollQueue } = initialized;

    sendEvent(res, "task_status", { data: taskData, error: null });

    heartbeatHandle = setInterval(() => {
      ResultScrapingLog.updateOne(
        { _id: taskId, lockedBy: stream.workerId },
        { $set: lockTimestamps() }
      ).catch(() => {}); // Suppress errors if task deleted
    }, HEARTBEAT_INTERVAL_MS);

    await processQueue(stream, taskId, taskData, rollQueue);

    if (stream.alive) {
      await ResultScrapingLog.updateOne(
        { _id: taskId, lockedBy: stream.workerId },
        {
          $set: {
            status: TASK_STATUS.COMPLETED,
            endTime: new Date(),
            lockedBy: null,
            lockExpiresAt: null,
            queue: [],
          },
        }
      );

      taskData.status = TASK_STATUS.COMPLETED;
      taskData.queue = [];
      sendEvent(res, "task_status", { data: taskData, error: null });
      res.end();
    }
  } catch (error) {
    console.error("Scraping Error:", error);
    const message =
      error instanceof TaskError
        ? error.message
        : "The scrape stopped on a server error. Resume it to continue.";
    sendEvent(res, "error", { data: null, error: message });
    res.end();
  } finally {
    clearInterval(keepAliveLoop);
    await cleanup();
  }
}
