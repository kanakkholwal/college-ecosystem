export const EVENTS = {
  TASK_STATUS: "task_status",
  TASK_PAUSED_RESUME: "task_paused_resume",
  STREAM_SCRAPING: "stream_scraping",
  TASK_DELETE: "delete_task",
  TASK_CLEAR_ALL: "clear_all_tasks",
  TASK_GET_LIST: "task_list",
  TASK_RETRY_FAILED: "task_retry_failed",
} as const;

/** Statuses apps/server writes; `in_progress` comes from its create-batch endpoint. */
export const TASK_STATUS = {
  SCRAPING: "scraping",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  IN_PROGRESS: "in_progress",
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

export type ListType = (typeof LIST_TYPE)[keyof typeof LIST_TYPE];
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

/** Offered when starting a task. `full_reset` is left out: the server builds the same queue as `all`. */
export const LIST_OPTIONS: {
  value: ListType;
  label: string;
  description: string;
}[] = [
  {
    value: LIST_TYPE.BACKLOG,
    label: "Has a failed course",
    description:
      "Records with any course graded 0, oldest first. Use after supplementary results.",
  },
  {
    value: LIST_TYPE.NEW_SEMESTER,
    label: "Missing semesters",
    description:
      "B.Tech under 8, B.Arch under 10 and Dual Degree under 12 semesters. Use after regular results.",
  },
  {
    value: LIST_TYPE.FRESHERS,
    label: "Freshers",
    description:
      "Newest batch with at most one semester stored. Use after first-semester results.",
  },
  {
    value: LIST_TYPE.DUAL_DEGREE,
    label: "Dual Degree, past year 3",
    description: "Dual Degree records with more than 6 semesters.",
  },
  {
    value: LIST_TYPE.NEW_BATCH,
    label: "Next batch (guessed)",
    description:
      "Roll numbers generated from the newest batch's ranges, one year on. Many may not exist yet.",
  },
  {
    value: LIST_TYPE.ALL,
    label: "Every record",
    description:
      "Re-scrapes the whole database. Slowest; hits the college site once per record.",
  },
];

export const LIST_LABELS: Record<string, string> = {
  ...Object.fromEntries(LIST_OPTIONS.map((o) => [o.value, o.label])),
  [LIST_TYPE.FULL_RESET]: "Full reset",
  previous_batch: "Create batch",
};

export type TaskFailure = { roll_no: string; reason: string };

/** Dates arrive as ISO strings over JSON. */
export type TaskData = {
  _id: string;
  taskId: string;
  list_type: ListType | string;
  status: TaskStatus | string;
  processable: number;
  processed: number;
  failed: number;
  success: number;
  data: TaskFailure[];
  startTime: string | number;
  endTime: string | number | null;
  successfulRollNos: string[];
  failedRollNos: string[];
  queue: string[];
};
