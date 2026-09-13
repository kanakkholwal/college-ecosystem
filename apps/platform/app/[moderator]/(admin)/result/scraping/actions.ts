"use server";

import type { PipelineStage } from "mongoose";
import dbConnect from "~/lib/dbConnect";
import { serverFetch } from "~/lib/fetch-server";
import ResultModel from "~/models/result";
import { assertAdmin, guarded } from "../guard";
import { EVENTS, LIST_TYPE, type TaskData } from "./types";

const TASKS_PATH = "/api/results/scrape-sse";

export async function listScrapeTasks(): Promise<TaskData[]> {
  await assertAdmin();
  const { data, error } = await serverFetch<{ data: TaskData[] }>(
    `${TASKS_PATH}?action=${EVENTS.TASK_GET_LIST}`
  );
  if (error) throw new Error(error.message || "Couldn't load scrape history");
  return JSON.parse(JSON.stringify(data?.data ?? []));
}

export async function deleteScrapeTask(taskId: string) {
  return guarded("Couldn't delete that task log", async () => {
    if (!/^[a-f0-9]{24}$/i.test(taskId)) throw new Error("Invalid task id.");
    const { error } = await serverFetch(
      `${TASKS_PATH}?action=${EVENTS.TASK_DELETE}&deleteTaskId=${taskId}`
    );
    if (error) throw new Error(error.message || "Couldn't delete that task log");
    return taskId;
  });
}

export async function clearScrapeTasks() {
  return guarded("Couldn't clear the history", async () => {
    const { error } = await serverFetch(
      `${TASKS_PATH}?action=${EVENTS.TASK_CLEAR_ALL}`
    );
    if (error) throw new Error(error.message || "Couldn't clear the history");
    return true;
  });
}

const semesterCount = { $size: { $ifNull: ["$semesters", []] } };

async function latestBatch() {
  const [row] = await ResultModel.aggregate<{ maxBatch: number }>([
    { $group: { _id: null, maxBatch: { $max: "$batch" } } },
  ] as PipelineStage[]);
  return row?.maxBatch ?? null;
}

/** Queue sizes the server would build, from the same filters as apps/server getListOfRollNos. */
export async function getScrapeEstimates(): Promise<Record<string, number | null>> {
  await assertAdmin();
  await dbConnect();
  const safe = (p: Promise<number>) => p.catch(() => null);
  const [all, backlog, newSemester, dualDegree, freshers] = await Promise.all([
    safe(ResultModel.countDocuments()),
    safe(ResultModel.countDocuments({ "semesters.courses.cgpi": 0 })),
    safe(
      ResultModel.countDocuments({
        $expr: {
          $lt: [
            semesterCount,
            {
              $switch: {
                branches: [
                  { case: { $eq: ["$programme", "B.Tech"] }, then: 8 },
                  { case: { $eq: ["$programme", "B.Arch"] }, then: 10 },
                  { case: { $eq: ["$programme", "Dual Degree"] }, then: 12 },
                ],
                default: 0,
              },
            },
          ],
        },
      })
    ),
    safe(
      ResultModel.countDocuments({
        programme: "Dual Degree",
        $expr: { $gt: [semesterCount, 6] },
      })
    ),
    safe(
      latestBatch().then((batch) =>
        batch === null
          ? 0
          : ResultModel.countDocuments({
              batch,
              $expr: { $lte: [semesterCount, 1] },
            })
      )
    ),
  ]);
  return {
    [LIST_TYPE.ALL]: all,
    [LIST_TYPE.FULL_RESET]: all,
    [LIST_TYPE.BACKLOG]: backlog,
    [LIST_TYPE.NEW_SEMESTER]: newSemester,
    [LIST_TYPE.DUAL_DEGREE]: dualDegree,
    [LIST_TYPE.FRESHERS]: freshers,
    [LIST_TYPE.NEW_BATCH]: null,
  };
}
