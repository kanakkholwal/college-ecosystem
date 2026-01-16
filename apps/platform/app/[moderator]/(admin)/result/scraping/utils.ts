import { serverFetch } from "~/lib/fetch-client";
import { EVENTS, type taskDataType } from "./types";

export const scrapingApi = {
  getTaskList: () =>
    serverFetch<{
      data: taskDataType[];
      error?: string | null;
    }>(`/api/results/scrape-sse?action=${EVENTS.TASK_GET_LIST}`),

  deleteTask: (taskId: string) =>
    serverFetch<{
      data: taskDataType | null;
      error?: string | null;
    }>(
      `/api/results/scrape-sse?action=${EVENTS.TASK_DELETE}&deleteTaskId=${taskId}`
    ),
  clearAllTasks: () =>
    serverFetch<{
      data: taskDataType[];
      error?: string | null;
    }>(`/api/results/scrape-sse?action=${EVENTS.TASK_CLEAR_ALL}`),
} as const;
