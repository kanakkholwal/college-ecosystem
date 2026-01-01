"use client";

import { formatDistanceToNow, formatRelative } from "date-fns";
import { EventSource } from "eventsource";
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Clock,
  List,
  MoreHorizontal,
  Play,
  RefreshCw,
  Square,
  Trash2,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Logic & Utils
import { NumberTicker } from "@/components/animation/number-ticker";
import { cn } from "@/lib/utils";
import { authHeaders } from "~/lib/fetch-client";
import { EVENTS, LIST_TYPE, TASK_STATUS, taskDataType } from "./types";
import { scrapingApi } from "./utils";

const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BASE_SERVER_URL;
const sseEndpoint = new URL(`${BASE_SERVER_URL}/api/results/scrape-sse`);

export default function ScrapeResultPage() {
  const router = useRouter();
  const eventSourceRef = useRef<EventSource | null>(null);
  const mountedRef = useRef(true);

  // State
  const [listType, setListType] = useState<(typeof LIST_TYPE)[keyof typeof LIST_TYPE]>(LIST_TYPE.BACKLOG);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskList, setTaskList] = useState<taskDataType[]>([]);

  // Active Task State
  const [taskData, setTaskData] = useState<taskDataType>({
    processable: 0,
    status: TASK_STATUS.IDLE,
    processed: 0,
    failed: 0,
    success: 0,
    data: [],
    startTime: Date.now(),
    endTime: null,
    successfulRollNos: [],
    failedRollNos: [],
    queue: [],
    list_type: listType,
    taskId: "",
    _id: "",
  });

  const handleAction = (id: string, type: string, listType?: string) => {
    handleStartScraping({
      listType: listType as (typeof LIST_TYPE)[keyof typeof LIST_TYPE],
      actionType: type,
      task_resume_id: id,
    });
  };

  const closeConnection = () => {
    if (eventSourceRef.current) {
      try { eventSourceRef.current.close(); } catch {}
      eventSourceRef.current = null;
    }
    setStreaming(false);
  };

  // KEEP the SSE connection mechanism EXACTLY as you provided (unchanged)
  const handleStartScraping = (payload?: { listType: any; actionType: string; task_resume_id: string }) => {
    // Prevent concurrent streams
    if (streaming) {
      toast.error("A scraping task is already running.");
      return;
    }

    if (eventSourceRef.current) {
      try { eventSourceRef.current.close(); } catch {}
      eventSourceRef.current = null;
    }
    setError(null);

    // URL Param Logic (mutating the shared sseEndpoint as in your original)
    if (payload) {
      setListType(payload.listType);
      sseEndpoint.searchParams.set("list_type", payload.listType);
      sseEndpoint.searchParams.set("action", payload.actionType);
      if (payload.task_resume_id) sseEndpoint.searchParams.set("task_resume_id", payload.task_resume_id);
    } else {
      sseEndpoint.searchParams.set("list_type", listType);
      sseEndpoint.searchParams.delete("task_resume_id");
      sseEndpoint.searchParams.set("action", EVENTS.STREAM_SCRAPING);
    }

    // update URL for visibility/bookmark
    router.push(`?${sseEndpoint.searchParams.toString()}`);
    setStreaming(true);

    // SSE Setup (EXACT snippet preserved)
    const es = new EventSource(sseEndpoint.toString(), {
      withCredentials: true,
      fetch: (input, init) => fetch(input, {
        ...init,
        headers: { ...init.headers, ...authHeaders, "X-Identity-Key": authHeaders["X-Identity-Key"], "X-Authorization": authHeaders["X-Authorization"] },
      }),
    });

    eventSourceRef.current = es;

    // ---- listeners (fixed parsing, guards, no memory leaks) ----

    const onTaskStatus = (e: MessageEvent) => {
      if (!mountedRef.current) return;
      try {
        const parsed = JSON.parse(e.data);
        const payload = parsed?.data ?? null;
        if (!payload) return;

        // merge safely: use server as authoritative for fields present
        setTaskData((prev) => ({ ...prev, ...payload }));

        // detect completion/cancel based on task_status payload
        if (payload.status === TASK_STATUS.COMPLETED || payload.status === TASK_STATUS.CANCELLED) {
          if (payload.status === TASK_STATUS.COMPLETED) toast.success("Scraping completed.");
          if (payload.status === TASK_STATUS.CANCELLED) toast("Scraping cancelled.");
          setStreaming(false);
          try { es.close(); } catch {}
          eventSourceRef.current = null;
        }
      } catch (err) {
        console.error("Failed to parse task_status event", err);
      }
    };

    const onTaskList = (e: MessageEvent) => {
      if (!mountedRef.current) return;
      try {
        const parsed = JSON.parse(e.data);
        const payload = parsed?.data ?? null;
        if (Array.isArray(payload)) setTaskList(payload);
      } catch (err) {
        console.error("Failed to parse task_list event", err);
      }
    };

    const onError = (ev: Event | MessageEvent) => {
      if (!mountedRef.current) return;
      let errMsg = "Connection Error";
      try {
        if ((ev as MessageEvent).data) {
          const parsed = JSON.parse((ev as MessageEvent).data as string);
          if (parsed?.error) errMsg = parsed.error;
          else if (parsed?.data?.error) errMsg = parsed.data.error;
        } else {
          const readyState = (es as any)?.readyState;
          if (readyState === 0) errMsg = "Connecting...";
          else if (readyState === 2) errMsg = "Connection closed by server";
        }
      } catch {
        // ignore parse problems
      }

      setError(errMsg);
      toast.error(errMsg);
      setStreaming(false);
      try { es.close(); } catch {}
      eventSourceRef.current = null;
    };

    // attach listeners
    es.addEventListener("task_status", onTaskStatus as EventListener);
    es.addEventListener("task_list", onTaskList as EventListener);
    // preserve listening for server-sent 'error' events but handle native errors too
    es.addEventListener("error", onError as EventListener);
    es.onerror = onError as any;

    // no cleanup return here (original pattern): rely on explicit closeConnection and effect cleanup
  };

  useEffect(() => {
    mountedRef.current = true;

    scrapingApi.getTaskList().then(({ data }) => {
      if (data?.data) setTaskList(data.data);
    }).catch(e => toast.error(e.message));

    return () => {
      mountedRef.current = false;
      try { eventSourceRef.current?.close(); } catch {}
      eventSourceRef.current = null;
      setStreaming(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Render ---

  const showLive = streaming || error; // don't use stale task._id to keep card visible forever

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">

      {/* 1. Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scraper Operations</h1>
          <p className="text-muted-foreground">Manage real-time scraping tasks and view historical logs.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border p-1.5 rounded-lg shadow-sm">
          <Select value={listType} onValueChange={(v: any) => setListType(v)}>
            <SelectTrigger className="w-[140px] border-none shadow-none h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LIST_TYPE).map(([k, v]) => (
                <SelectItem key={k} value={v}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="h-6" />
          <Button
            size="sm"
            onClick={() => handleStartScraping()}
            disabled={streaming}
            className={cn("h-8", streaming ? "opacity-50" : "bg-primary")}
          >
            {streaming ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <Play className="w-3 h-3 mr-2" />}
            {streaming ? "Running..." : "Start Task"}
          </Button>
        </div>
      </div>

      {/* 2. Live Monitor (Only visible if active or error) */}
      {showLive && (
        <LiveMonitorCard
          task={taskData}
          streaming={streaming}
          error={error}
          onStop={closeConnection}
        />
      )}

      {/* 3. History Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-semibold">Task History</CardTitle>
              <CardDescription>Recent scraping sessions and their outcomes.</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive h-8"
              disabled={taskList.length === 0}
              onClick={() => {
                if (confirm("Clear all history?")) {
                  scrapingApi.clearAllTasks().then(() => {
                    setTaskList([]);
                    toast.success("History cleared");
                  });
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear History
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {taskList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <List className="w-10 h-10 mb-3 opacity-20" />
              <p>No scraping history found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Success</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskList.map((task) => (
                  <HistoryRow
                    key={task._id}
                    task={task}
                    onAction={(id, type, lt) => handleAction(id, type, lt)}
                    onDelete={(id) => setTaskList(prev => prev.filter(t => t._id !== id))}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

// --- Sub-Components ---

function LiveMonitorCard({ task, streaming, error, onStop }: any) {
  const percent = task.processable > 0 ? Math.min(100, Math.round((task.processed / task.processable) * 100)) : 0;

  return (
    <Card className={cn("border-l-2 rounded-l-none", error ? "border-l-red-500" : streaming ? "border-l-indigo-500" : "border-l-primary")}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight">
                {error ? "Task Failed" : streaming ? "Processing Batch..." : "Task Idle"}
              </h3>
              {streaming && <Badge variant="secondary" className="animate-pulse text-blue-600 bg-blue-50">Live</Badge>}
            </div>
            <p className="text-xs font-mono text-muted-foreground">ID: {task._id || "Waiting..."}</p>
          </div>
          {streaming && (
            <Button variant="destructive" size="sm" onClick={onStop}>
              <Square className="w-4 h-4 mr-2 fill-current" /> Stop
            </Button>
          )}
        </div>

        {error ? (
          <div className="bg-red-50 text-red-900 p-3 rounded-md text-sm border border-red-100 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" /> {error}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Progress</span>
                <span>{percent}% ({task.processed} / {task.processable})</span>
              </div>
              <Progress value={percent} className="h-2" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricItem label="Queue" value={task.queue?.length || 0} icon={List} color="text-gray-500" />
              <MetricItem label="Processed" value={task.processed} icon={Activity} color="text-blue-600" />
              <MetricItem label="Successful" value={task.success} icon={CheckCircle2} color="text-green-600" />
              <MetricItem label="Failed" value={task.failed} icon={XCircle} color="text-red-600" />
            </div>

            {task.failed > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-red-600 mb-2">Failed Roll Numbers:</p>
                <FailedRollNumbers task={task} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricItem({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex flex-col p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className={cn("text-2xl font-bold tracking-tight", color)}>
        <NumberTicker value={value} />
      </div>
    </div>
  );
}
interface HistoryRowProps {
  task: taskDataType;
  onAction: (id: string, type: string, listType?: string) => void;
  onDelete: (id: string) => void;
}

function HistoryRow({ task, onAction, onDelete }: HistoryRowProps) {
  const duration = task.endTime
    ? formatDistanceToNow(new Date(task.endTime), { addSuffix: true })
    : "Incomplete";

  const percent = task.processable > 0 ? Math.min(100, Math.round((task.processed / task.processable) * 100)) : 0;
  const isComplete = task.status === TASK_STATUS.COMPLETED;

  return (
    <TableRow className="group">
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {formatRelative(new Date(task.startTime), new Date())}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {duration}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">{task.list_type}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress value={percent} className="w-16 h-1.5" />
          <span className="text-xs text-muted-foreground">{percent}%</span>
        </div>
      </TableCell>
      <TableCell className="text-green-600 font-medium text-xs">{task.success}</TableCell>
      <TableCell>
        {task.failed > 0 ? (
          <ResponsiveDialog
            btnProps={{ variant: "ghost", size: "sm", className: "text-red-600 h-6 px-2 text-xs hover:bg-red-50", children: <span>{task.failed} (View)</span> }}
            title="Failed Items"
            description={`Task ID: ${task._id}`}
          >
            <FailedRollNumbers task={task} />
          </ResponsiveDialog>
        ) : (
          <span className="text-muted-foreground text-xs">0</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {task.processed < task.processable && (
              <DropdownMenuItem onClick={() => onAction(task._id, EVENTS.TASK_PAUSED_RESUME, task.list_type)}>
                <Play className="w-4 h-4 mr-2" /> Resume Task
              </DropdownMenuItem>
            )}

            {isComplete && task.failed > 0 && (
              <DropdownMenuItem onClick={() => onAction(task._id, EVENTS.TASK_RETRY_FAILED, task.list_type)}>
                <RefreshCw className="w-4 h-4 mr-2" /> Retry Failed
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => {
                scrapingApi.deleteTask(task._id).then(() => onDelete(task._id));
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Log
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function FailedRollNumbers({ task }: { task: taskDataType }) {
  if (!task.failedRollNos || task.failedRollNos.length === 0) return <p className="text-sm text-muted-foreground">No failed items recorded.</p>;

  return (
    <div className="flex gap-1.5 flex-wrap">
      {task.failedRollNos.slice(0, 20).map((item) => (
        <Badge key={item} variant="destructive" className="font-mono text-xs">
          {item}
        </Badge>
      ))}
      {task.failedRollNos.length > 20 && (
        <Badge variant="outline" className="text-xs">
          +{task.failedRollNos.length - 20} more
        </Badge>
      )}
    </div>
  );
}
