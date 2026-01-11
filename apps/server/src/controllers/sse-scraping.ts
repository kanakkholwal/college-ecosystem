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
import type { IResultScrapingLog, taskDataType } from "../models/log-result_scraping";
import { ResultScrapingLog } from "../models/log-result_scraping";
import dbConnect from "../utils/dbConnect";

// Lower batch size ensures we send updates more frequently to keep connection alive
const BATCH_SIZE = 5; 
const MAX_ERRORS = 1000;
// Tighter lock window so users can retry faster if the server crashes hard
const LOCK_TTL_MS = 30_000; 
const HEARTBEAT_INTERVAL_MS = 10_000; 

// ---------------- helpers ----------------
const sendEvent = (
  res: Response,
  event: string,
  payload: { data: taskDataType | null; error?: string | null }
) => {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    // Force flush if methods exist (Node/Express specific)
    if ((res as any).flush) (res as any).flush();
  } catch {
    // client disconnected
  }
};

const sendKeepAlive = (res: Response) => {
  try {
    res.write(": keep-alive\n\n");
    if ((res as any).flush) (res as any).flush();
  } catch {}
};

const activeSSEConnections = new Map<string, Response>();

const normalizeIp = (req: Request): string | null => {
  const raw = req.headers["x-forwarded-for"];
  if (typeof raw === "string") return raw.split(",")[0].trim();
  if (Array.isArray(raw)) return raw[0];
  return req.socket.remoteAddress ?? null;
};

// ---------------- handler ----------------

export async function resultScrapingSSEHandler(req: Request, res: Response) {
  const list_type = (req.query.list_type as string) || LIST_TYPE.BACKLOG;
  const actionType = req.query.action as string | undefined;
  const task_resume_id = req.query.task_resume_id as string | undefined;

  await dbConnect();

  // --- Quick Actions (No SSE) ---
  if (actionType === EVENTS.TASK_GET_LIST) {
    const tasks = await ResultScrapingLog.find({}).sort({ startTime: -1 }).limit(20);
    return res.status(200).json({ data: tasks, error: null });
  }
  if (actionType === EVENTS.TASK_CLEAR_ALL) {
    await ResultScrapingLog.deleteMany({});
    return res.status(200).json({ data: [], error: null });
  }
  if (actionType === EVENTS.TASK_DELETE) {
    if (!req.query.deleteTaskId) return res.status(400).send("Task ID required");
    await ResultScrapingLog.deleteOne({ _id: req.query.deleteTaskId });
    return res.status(200).json({ data: [], error: null });
  }

  // --- SSE Setup ---
  // Validate headers
  if (!actionType || !Object.values(EVENTS).includes(actionType as any)) {
    return res.status(400).json({ data: null, error: "Invalid action type" });
  }

  const ip = normalizeIp(req);
  if (!ip) return res.status(400).send("IP identification failed");

  // Prevent duplicate tabs
  if (activeSSEConnections.has(ip)) {
    // Optional: Kill the old connection to let new one take over? 
    // For now, strict blocking:
    return res.status(429).json({ error: "Connection limit reached. Close other tabs." });
  }
  activeSSEConnections.set(ip, res);

  // Headers for streaming
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no", // Disable Nginx buffering
  });
  
  res.write("\n"); // Initial byte to establish stream

  const WORKER_ID = `${process.pid}:${crypto.randomUUID()}`;
  let mongoTaskId: string | null = null;
  let isConnectionAlive = true;
  let heartbeatHandle: NodeJS.Timeout | null = null;

  // Cleanup Function
  const cleanup = async () => {
    isConnectionAlive = false;
    activeSSEConnections.delete(ip);
    if (heartbeatHandle) clearInterval(heartbeatHandle);
    
    // Release lock if we own it
    if (mongoTaskId) {
      await ResultScrapingLog.updateOne(
        { _id: mongoTaskId, lockedBy: WORKER_ID },
        { 
          $set: { 
            lockedBy: null, 
            lockExpiresAt: null,
            // If we closed unexpectedly, mark as cancelled so client knows to resume
            status: TASK_STATUS.CANCELLED 
          } 
        }
      ).catch(console.error);
    }
  };

  req.on("close", cleanup);
  
  // High-frequency keep-alive (every 10s)
  const keepAliveLoop = setInterval(() => {
    if (!isConnectionAlive) {
        clearInterval(keepAliveLoop);
        return;
    }
    sendKeepAlive(res);
  }, 10000);


  try {
    let taskData: taskDataType | null = null;
    let roll_queue: string[] = [];

    // --- 1. Initialization (Create or Load Task) ---
    
    if (actionType === EVENTS.TASK_PAUSED_RESUME || actionType === EVENTS.TASK_RETRY_FAILED) {
      if (!task_resume_id) throw new Error("Task ID missing for resume");
      
      const existing = await ResultScrapingLog.findById<IResultScrapingLog>(task_resume_id).lean();
      if (!existing) throw new Error("Task not found");

      mongoTaskId = String(existing._id);
      
      // Reset state for processing
      taskData = { ...existing } as any;
      taskData!.status = TASK_STATUS.SCRAPING;
      taskData!.endTime = null;

      // Determine queue based on action
      if (actionType === EVENTS.TASK_PAUSED_RESUME) {
        roll_queue = taskData!.queue || [];
      } else {
        // Retry Failed: Move failed items back to queue
        roll_queue = taskData!.failedRollNos || [];
        taskData!.failedRollNos = []; // Clear failed list since we are retrying them
        
        // Update DB to reflect this reset immediately
        await ResultScrapingLog.updateOne(
            { _id: mongoTaskId },
            { $set: { failedRollNos: [], queue: roll_queue } }
        );
      }

    } else if (actionType === EVENTS.STREAM_SCRAPING) {
      // New Task
      const rolls = await getListOfRollNos(list_type as listType);
      roll_queue = Array.from(rolls);
      
      if (roll_queue.length === 0) throw new Error("No roll numbers found");

      const newTask = {
        list_type,
        taskId: `scrape:${list_type}:${Date.now()}`,
        status: TASK_STATUS.SCRAPING,
        startTime: new Date(),
        processable: roll_queue.length,
        processed: 0,
        success: 0,
        failed: 0,
        queue: roll_queue,
        successfulRollNos: [],
        failedRollNos: [],
        data: []
      };

      const created = await ResultScrapingLog.create(newTask);
      mongoTaskId = created._id.toString();
      taskData = newTask as any;
      taskData!._id = mongoTaskId!;
    }

    if (!mongoTaskId || !taskData) throw new Error("Initialization failed");

    // Send initial state
    sendEvent(res, "task_status", { data: taskData, error: null });

    // --- 2. Locking ---
    
    const acquiredLock = await ResultScrapingLog.findOneAndUpdate(
      {
        _id: mongoTaskId,
        $or: [
            { lockedBy: null },
            { lockedBy: WORKER_ID }, // We already own it (rare re-entry)
            { lockExpiresAt: { $lt: new Date() } } // Stale lock
        ]
      },
      {
        $set: {
          lockedBy: WORKER_ID,
          lockExpiresAt: new Date(Date.now() + LOCK_TTL_MS),
          status: TASK_STATUS.SCRAPING,
          lastHeartbeat: new Date()
        }
      },
      { new: true }
    );

    if (!acquiredLock) {
      sendEvent(res, "error", { data: null, error: "Task is locked by another worker. Please wait." });
      res.end();
      return;
    }

    // Start DB Heartbeat
    heartbeatHandle = setInterval(async () => {
      if (!mongoTaskId) return;
      await ResultScrapingLog.updateOne(
        { _id: mongoTaskId, lockedBy: WORKER_ID },
        { 
            $set: { 
                lockExpiresAt: new Date(Date.now() + LOCK_TTL_MS),
                lastHeartbeat: new Date()
            } 
        }
      ).catch(() => {}); // Suppress errors if task deleted
    }, HEARTBEAT_INTERVAL_MS);


    // --- 3. Processing Loop ---

    // Fetch fresh queue from DB in case of concurrent mods (though we have lock)
    const currentDoc = await ResultScrapingLog.findById<IResultScrapingLog>(mongoTaskId).select('queue').lean();
    if (currentDoc?.queue) roll_queue = currentDoc.queue;

    let processedCount = 0;

    for (let i = 0; i < roll_queue.length; i += BATCH_SIZE) {
      if (!isConnectionAlive) break;

      const batch = roll_queue.slice(i, i + BATCH_SIZE);
      
      // Process batch in parallel
      const results = await Promise.allSettled(batch.map(roll => scrapeAndSaveResult(roll)));

      // Process results one by one
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const rollNo = batch[j];
        const isSuccess = result.status === "fulfilled" && result.value?.success;
        const errReason = result.status === "rejected" ? String(result.reason) : (result.value?.error || "Unknown error");

        if (isSuccess) {
          await ResultScrapingLog.updateOne(
            { _id: mongoTaskId },
            { 
              $inc: { processed: 1, success: 1 },
              $pull: { queue: rollNo },
              $addToSet: { successfulRollNos: rollNo }
            }
          );
          taskData.success++;
        } else {
          await ResultScrapingLog.updateOne(
            { _id: mongoTaskId },
            { 
              $inc: { processed: 1, failed: 1 },
              $pull: { queue: rollNo },
              $addToSet: { failedRollNos: rollNo },
              $push: { 
                 data: { 
                    $each: [{ roll_no: rollNo, reason: errReason }], 
                    $slice: -MAX_ERRORS // Keep array size manageable
                 } 
              }
            }
          );
          taskData.failed++;
        }
        
        taskData.processed++;
        
        // **CRITICAL**: Send a tiny "tick" to the client after EVERY item
        // This prevents 30s timeouts if a single item takes 10s
        sendKeepAlive(res);
      }

      // Update in-memory queue reference for UI
      taskData.queue = roll_queue.slice(i + BATCH_SIZE);

      // Send Full State Update after batch
      sendEvent(res, "task_status", { data: taskData, error: null });
      
      // Tiny breathing room for event loop
      await sleep(500);
    }

    // --- 4. Completion ---
    
    if (isConnectionAlive) {
      await ResultScrapingLog.updateOne(
        { _id: mongoTaskId, lockedBy: WORKER_ID },
        {
          $set: {
            status: TASK_STATUS.COMPLETED,
            endTime: new Date(),
            lockedBy: null,
            lockExpiresAt: null,
            queue: [] // Ensure empty
          }
        }
      );
      
      taskData.status = TASK_STATUS.COMPLETED;
      taskData.queue = [];
      sendEvent(res, "task_status", { data: taskData, error: null });
      res.end();
    }

  } catch (error: any) {
    console.error("Scraping Error:", error);
    sendEvent(res, "error", { data: null, error: error.message || "Internal Server Error" });
    res.end();
  } finally {
    clearInterval(keepAliveLoop);
    await cleanup();
  }
}