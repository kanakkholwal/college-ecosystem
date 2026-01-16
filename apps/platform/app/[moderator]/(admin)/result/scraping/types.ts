export const EVENTS = {
  TASK_STATUS: "task_status",

  TASK_PAUSED_RESUME: "task_paused_resume",

  STREAM_SCRAPING: "stream_scraping",

  TASK_DELETE: "delete_task",
  TASK_CLEAR_ALL: "clear_all_tasks",
  TASK_GET_LIST: "task_list",
  TASK_RETRY_FAILED: "task_retry_failed",
} as const;

export const TASK_STATUS = {
  IDLE: "idle",
  QUEUED: "queued",
  SCRAPING: "scraping",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  PAUSED: "paused",
} as const;

export const LIST_TYPE = {
  ALL: "all",
  BACKLOG: "has_backlog",
  NEW_SEMESTER: "new_semester",
  DUAL_DEGREE: "dual_degree",
  NEW_BATCH: "new_batch",
  FULL_RESET: "full_reset",
  FRESHERS: "freshers",

} as const;
type listType = (typeof LIST_TYPE)[keyof typeof LIST_TYPE];

export type taskDataType = {
  processable: number;
  processed: number;
  failed: number;
  success: number;
  data: {
    roll_no: string;
    status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
  }[];
  startTime: number;
  endTime: number | null;
  status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
  successfulRollNos: string[];
  failedRollNos: string[];
  queue: string[];
  list_type: listType;
  taskId: string;
  _id: string;
};
