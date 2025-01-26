"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Pause, Play, Wifi, WifiOff, X } from "lucide-react";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import ConditionalRender from "@/components/utils/conditional-render";

const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BASE_SERVER_URL;

const socket = io(BASE_SERVER_URL, {
  path: "/ws/results-scraping",
  withCredentials: true,
  transports: ["websocket"], // or ['websocket', 'polling']
  // autoConnect: false,
});

const EVENTS = {
  TASK_STATUS: "task_status",
  TASK_START: "task_start",
  TASK_CANCEL: "task_cancel",
  TASK_PAUSE: "task_pause",
  TASK_PAUSED_RESUME: "task_paused_resume",
  TASK_DELETE_CANCELLED: "task_delete_cancelled",
  TASK_RESUME_LAST: "task_resume_last",
  TASK_RETRY_FAILED: "task_retry_failed",
} as const;

const TASK_STATUS = {
  IDLE: "idle",
  QUEUED: "queued",
  SCRAPING: "scraping",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  PAUSED: "paused",
} as const;

const LIST_TYPE = {
  ALL: "all",
  BACKLOG: "has_backlog",
  NEW_SEMESTER: "new_semester",
} as const;
type listType = (typeof LIST_TYPE)[keyof typeof LIST_TYPE];

type taskDataType = {
  processable: number;
  processed: number;
  failed: number;
  success: number;
  skipped: number;
  data: {
    roll_no: string;
    status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
  }[];
  startTime: number;
  endTime: number | null;
  status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
  successfulRollNos: string[];
  failedRollNos: string[];
  skippedRollNos: string[];
  list_type: listType;
  taskId: string;
};
export default function ScrapeResultPage() {
  const [connected, setConnected] = useState(socket.connected);
  const [transportName, setTransportName] = useState(
    socket.io.engine.transport.name
  );
  const [listType, setListType] = useState<
    (typeof LIST_TYPE)[keyof typeof LIST_TYPE]
  >(LIST_TYPE.BACKLOG);
  const [error, setError] = useState<string | null>(null);
  const [taskList, setTaskList] = useState<taskDataType[]>([]);

  const [taskData, setTaskData] = useState<taskDataType>({
    processable: 0,
    status: TASK_STATUS.IDLE,
    processed: 0,
    failed: 0,
    success: 0,
    skipped: 0,
    data: [],
    startTime: Date.now(),
    endTime: null,
    successfulRollNos: [],
    failedRollNos: [],
    skippedRollNos: [],
    list_type: listType,
    taskId: "",
  });

  const handleAction = (id: string, type: string) => {
    console.log("action:", id, type);
    setError(null);
    const acceptableActions: string[] = [
      EVENTS.TASK_PAUSED_RESUME,
      EVENTS.TASK_CANCEL,
      EVENTS.TASK_RETRY_FAILED,
    ];
    if (acceptableActions.includes(type)) {
      socket.emit(type, id);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
      setConnected(true);
      setTransportName(socket.io.engine.transport.name);
    });
    socket.on("disconnect", () => {
      console.log("disconnected");
      setConnected(false);
      setTaskData({
        ...taskData,
        status: TASK_STATUS.IDLE,
      });
    });
    socket.on("reconnect", () => {
      console.log("reconnected");
      setConnected(true);
      setTransportName(socket.io.engine.transport.name);
    });
    socket.on("task_error", (message) => {
      console.log("task_error:", message);
      setError(message);
    });
    socket.on("task_list", (message) => {
      console.log("---task_list---");
      console.log(message);
      setTaskList(message);
      console.log("---task_list---");
    });
    socket.on("task_paused_resume", (message) => {
      console.log("task_paused_resume:", message);
      socket.emit(EVENTS.TASK_START, message);
    });
    socket.on(EVENTS.TASK_STATUS, (message) => {
      console.log(EVENTS.TASK_STATUS);
      console.table(message);
      setTaskData({
        ...message,
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnect");
      socket.off(EVENTS.TASK_STATUS);
      socket.off("task_error");
      socket.off("task_list");
    };
  }, [taskData]);

  return (
    <>
      <Alert suppressHydrationWarning={true}>
        {connected ? (
          <Wifi className="size-6 text-green-500!" />
        ) : (
          <WifiOff className="size-6 text-red-500!" />
        )}
        <AlertTitle>Connection ({transportName})</AlertTitle>
        <AlertDescription className="flex items-center space-x-2">
          {connected ? (
            <Badge variant="success">Connected</Badge>
          ) : (
            <Badge variant="destructive">Disconnected</Badge>
          )}
        </AlertDescription>
      </Alert>
      <section className="p-6 border border-gray-200 rounded-lg bg-slate-100 shadow-sm space-y-5">
        <div
          aria-label="header"
          className="text-lg font-semibold border-b pb-5"
        >
          Scraping Result{" "}
          <Badge variant="info" className="ml-2">
            {taskData.status}
          </Badge>
        </div>
        {error && (
          <p className="text-red-500 p-2 border border-red-500 bg-red-100 rounded-md text-sm">
            {error}
            <X
              className="size-4 text-red-500! ml-auto inline-block cursor-pointer"
              role="button"
              onClick={() => setError(null)}
            />
          </p>
        )}
        {taskData?.taskId ? (
          <DisplayTask task={taskData} />
        ) : (
          <div className="grid grid-cols-1 gap-2 bg-white p-3 rounded-md shadow-sm">
            <div className="flex gap-4">
              <h5 className="text-sm font-semibold">#No Task Running</h5>
            </div>
          </div>
        )}

        <div
          aria-label="footer"
          className="flex items-center space-x-2 pt-5 border-t"
        >
          {taskData.taskId && (
            <Button
              size="sm"
              variant="default_light"
              onClick={() => {
                if (!taskData.taskId) return;
                socket.emit(EVENTS.TASK_STATUS, taskData.taskId);
                console.log("task status requested");
              }}
            >
              <Info />
              Task Status
            </Button>
          )}
          <ConditionalRender condition={taskData.status === TASK_STATUS.IDLE}>
            <Select
              value={listType}
              onValueChange={(value) =>
                setListType(value as (typeof LIST_TYPE)[keyof typeof LIST_TYPE])
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="List Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LIST_TYPE).map(([key, value]) => {
                  return (
                    <SelectItem key={key} value={value}>
                      {key}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              onClick={() => {
                console.log("start scraping", listType);
                socket.emit(EVENTS.TASK_START, listType);
              }}
            >
              Start new Scraping Task
            </Button>
          </ConditionalRender>
          <ConditionalRender
            condition={taskData.status === TASK_STATUS.SCRAPING}
          >
            <Button
              size="sm"
              variant="default_light"
              onClick={() => {
                socket?.emit(EVENTS.TASK_PAUSE, taskData.taskId);
                console.log("pause scraping", listType);
              }}
            >
              <Pause />
              Pause Scraping
            </Button>
            <Button
              size="sm"
              variant="destructive_light"
              onClick={() => {
                socket?.emit(EVENTS.TASK_CANCEL, taskData.taskId);
                console.log("cancel scraping", listType);
              }}
            >
              <X />
              Cancel Scraping
            </Button>
          </ConditionalRender>
          <ConditionalRender condition={taskData.status === TASK_STATUS.PAUSED}>
            <Button
              size="sm"
              onClick={() => {
                socket?.emit(EVENTS.TASK_START, listType);
                console.log("resume scraping", listType);
              }}
            >
              <Play />
              Start Scraping
            </Button>
          </ConditionalRender>
          <ConditionalRender condition={taskData.status === TASK_STATUS.FAILED}>
            <Button
              size="sm"
              onClick={() => {
                socket?.emit(EVENTS.TASK_START, listType);
                console.log("retry scraping", listType);
              }}
            >
              Retry Scraping
            </Button>
            <Button
              size="sm"
              variant="destructive_light"
              onClick={() => {
                socket?.emit(EVENTS.TASK_CANCEL, listType);
                console.log("cancel scraping", listType);
              }}
            >
              <X />
              Cancel Scraping
            </Button>
          </ConditionalRender>
          <ConditionalRender
            condition={taskData.status === TASK_STATUS.COMPLETED}
          >
            <Button
              size="sm"
              onClick={() => {
                socket?.emit(EVENTS.TASK_START, listType);
                console.log("start scraping", listType);
              }}
            >
              Start Scraping
            </Button>
          </ConditionalRender>
        </div>
      </section>

      <section className="p-6 border border-gray-200 rounded-lg bg-slate-100 shadow-sm">
        <div
          aria-label="header"
          className="text-lg font-semibold border-b pb-5 mb-5 flex w-full justify-between gap-4"
        >
          <div>
            Task List{" "}
            {taskList.length > 0 && (
              <Badge variant="info" className="ml-2">
                {taskList.length}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!connected}
              onClick={() => {
                socket.emit("task_list");
                console.log("task list requested");
              }}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              disabled={!connected}
              variant="destructive_light"
              onClick={() => {
                socket.emit(EVENTS.TASK_DELETE_CANCELLED);
                console.log("task delete cancelled requested");
              }}
            >
              Delete Cancelled
            </Button>
          </div>
        </div>
        {taskList.length === 0 && (
          <div className="grid grid-cols-1 gap-2 bg-primary/10 text-primary text-center p-3 rounded-md shadow-sm">
            <div className="flex gap-4">
              <h5 className="text-sm font-semibold">No Task Found</h5>
            </div>
          </div>
        )}
        {taskList.map((task) => {
          return (
            <DisplayTask
              task={task}
              key={task.startTime}
              actionFunction={handleAction}
            />
          );
        })}
      </section>
    </>
  );
}

function DisplayTask({
  task,
  actionFunction,
}: {
  task: taskDataType;
  actionFunction?: (id: string, type: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 bg-white p-3 rounded-md shadow-sm">
      <div className="flex gap-4">
        <Button size="sm" variant="ghost" className="text-sm lowercase">
          #{task.taskId.toLowerCase()}
        </Button>
        {actionFunction &&
          task.status !== TASK_STATUS.CANCELLED &&
          task.status !== TASK_STATUS.COMPLETED && (
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="default_light"
                onClick={() =>
                  actionFunction(task.taskId, EVENTS.TASK_PAUSED_RESUME)
                }
              >
                Resume
              </Button>
              <Button
                size="sm"
                variant="destructive_light"
                onClick={() => actionFunction(task.taskId, EVENTS.TASK_CANCEL)}
              >
                Cancel
              </Button>
            </div>
          )}
        {actionFunction && task.status === TASK_STATUS.COMPLETED && (
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="default_light"
              onClick={() =>
                actionFunction(task.taskId, EVENTS.TASK_RETRY_FAILED)
              }
            >
              Retry failed
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-6 border rounded-md p-2">
        <div className="whitespace-nowrap font-semibold text-base border-b p-2 text-center text-gray-800">
          Status
        </div>
        <div className="whitespace-nowrap font-semibold text-base border-b p-2 text-center text-gray-800">
          Processable
        </div>
        <div className="whitespace-nowrap font-semibold text-base border-b p-2 text-center text-gray-800">
          Processed
        </div>
        <div className="whitespace-nowrap font-semibold text-base border-b p-2 text-center text-gray-800">
          Failed
        </div>
        <div className="whitespace-nowrap font-semibold text-base border-b p-2 text-center text-gray-800">
          Success
        </div>
        <div className="whitespace-nowrap font-semibold text-base border-b p-2 text-center text-gray-800">
          Skipped
        </div>
        <div className="text-center p-2">
          <Badge variant="info">{task.status}</Badge>
        </div>
        <div className="text-center p-2">
          <Badge variant="info">{task.processable}</Badge>
        </div>
        <div className="text-center p-2">
          <Badge variant="info">{task.processed}</Badge>
        </div>
        <div className="text-center p-2">
          <Badge variant="info">{task.failed}</Badge>
        </div>
        <div className="text-center p-2">
          <Badge variant="info">{task.success}</Badge>
        </div>
        <div className="text-center p-2">
          <Badge variant="info">{task.skipped}</Badge>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {task.data
          .sort((a, b) => {
            if (a.status === TASK_STATUS.FAILED) return 1;
            if (b.status === TASK_STATUS.FAILED) return -1;
            return 0;
          })
          .map((item, index) => {
            if (index > 10) return null;
            return (
              <Badge
                key={item.roll_no}
                variant={
                  item.status === TASK_STATUS.FAILED ? "destructive" : "success"
                }
              >
                {item.roll_no} - {item.status}
              </Badge>
            );
          })}
      </div>
    </div>
  );
}
