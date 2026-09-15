"use client";

import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  FileSpreadsheet,
  LoaderCircle,
  Lock,
  LockOpen,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import toast from "react-hot-toast";
import { readSheet as readXlsxFile } from "read-excel-file/browser";
import wordsToNumbers from "words-to-numbers";
import BaseSearchBox from "@/components/application/base-search";
import type { FilterOption } from "@/components/application/filter-panel";
import { TableFrame, Td, Th } from "@/components/application/hostel/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  addHostelRooms,
  lockToggleRoom,
} from "~/actions/hostel.allotment-process";
import { callAction } from "~/lib/call-action";

const FILTERS: FilterOption[] = [
  {
    key: "availability",
    label: "Availability",
    values: [
      { value: "free", label: "Has free beds" },
      { value: "full", label: "Full" },
      { value: "locked", label: "Locked" },
    ],
  },
  {
    key: "capacity",
    label: "Beds per room",
    values: ["1", "2", "3", "4", "5", "6", "7"].map((v) => ({
      value: v,
      label: `${v} ${v === "1" ? "bed" : "beds"}`,
    })),
  },
];

export function RoomSearch() {
  return (
    <BaseSearchBox
      id="room-search"
      searchPlaceholder="Search by room number"
      filterOptions={FILTERS}
      filterDialogTitle="Filter rooms"
      filterDialogDescription="Narrow by free beds, lock state or room size."
      className="max-w-none"
    />
  );
}

/** Optimistic with rollback: the lock flips at once and reverts if the server refuses. */
export function RoomLockButton({
  roomId,
  roomNumber,
  locked,
}: {
  roomId: string;
  roomNumber: string;
  locked: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(locked);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    const previous = value;
    setValue(!previous);
    setPending(true);
    const res = await callAction(() => lockToggleRoom(roomId));
    setPending(false);
    if (!res.ok) {
      setValue(previous);
      toast.error(res.error);
      return;
    }
    setValue(res.data.isLocked);
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={pending}
      aria-label={`${value ? "Unlock" : "Lock"} room ${roomNumber}`}
    >
      {value ? <LockOpen aria-hidden="true" /> : <Lock aria-hidden="true" />}
      {value ? "Unlock" : "Lock"}
    </Button>
  );
}

type ParsedRoom = {
  row: number;
  roomNumber: string;
  capacity: number | null;
  problem: string | null;
};

function parseCapacity(raw: unknown): number | null {
  if (typeof raw === "number") return raw;
  const text = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!text) return null;
  const first = text.split(/\s+/)[0];
  const asNumber = Number(first);
  if (Number.isFinite(asNumber)) return asNumber;
  const words: Record<string, number> = { single: 1, double: 2, triple: 3 };
  if (words[first]) return words[first];
  const converted = wordsToNumbers(first);
  return typeof converted === "number" ? converted : null;
}

export function ImportRooms({ hostelId }: { hostelId: string }) {
  const router = useRouter();
  const fileId = useId();
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<unknown[][]>([]);
  const [roomCol, setRoomCol] = useState("");
  const [capCol, setCapCol] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    added: number;
    skipped: { roomNumber: string; reason: string }[];
  } | null>(null);

  const reset = () => {
    setFileName("");
    setHeaders([]);
    setRows([]);
    setRoomCol("");
    setCapCol("");
    setReviewing(false);
    setResult(null);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const [head, ...body] = await readXlsxFile(file);
      const names = head.map((h) => String(h ?? "").trim());
      const data = body.filter((r) =>
        r.some((c) => c !== null && String(c).trim() !== "")
      );
      if (data.length === 0) {
        toast.error("That sheet has a header row but no data");
        return;
      }
      setFileName(file.name);
      setHeaders(names);
      setRows(data);
      setRoomCol(names.find((h) => /room/i.test(h)) ?? "");
      setCapCol(names.find((h) => /capacity|seater|beds?/i.test(h)) ?? "");
    } catch {
      toast.error("Couldn't read that file. Upload an .xlsx sheet.");
    }
  };

  const parsed: ParsedRoom[] = reviewing
    ? (() => {
        const seen = new Set<string>();
        const r = headers.indexOf(roomCol);
        const c = headers.indexOf(capCol);
        return rows.map((row, i) => {
          const roomNumber = String(row[r] ?? "").trim();
          const capacity = parseCapacity(row[c]);
          let problem: string | null = null;
          if (!roomNumber) problem = "Room number is empty";
          else if (seen.has(roomNumber)) problem = "Repeated in this file";
          else if (
            !capacity ||
            !Number.isInteger(capacity) ||
            capacity < 1 ||
            capacity > 7
          )
            problem = "Capacity must be a whole number from 1 to 7";
          if (roomNumber) seen.add(roomNumber);
          return { row: i + 2, roomNumber, capacity, problem };
        });
      })()
    : [];
  const valid = parsed.filter((p) => !p.problem);
  const problems = parsed.length - valid.length;

  const commit = async () => {
    setBusy(true);
    const res = await callAction(() =>
      addHostelRooms(
        hostelId,
        valid.map((p) => ({
          roomNumber: p.roomNumber,
          capacity: p.capacity ?? 1,
        }))
      )
    );
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setResult(res.data);
    router.refresh();
  };

  const step = result ? 4 : reviewing ? 3 : fileName ? 2 : 1;

  return (
    <section
      aria-labelledby="room-import-heading"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 dark:bg-background"
    >
      <div className="space-y-1">
        <h2
          id="room-import-heading"
          className="text-subheading font-medium text-foreground"
        >
          Import rooms from a sheet
        </h2>
        <p className="text-body text-muted-foreground">
          Rooms that already exist are skipped. Nothing is saved until you
          confirm.
        </p>
      </div>

      {step === 1 && (
        <label
          htmlFor={fileId}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-10 text-center transition-colors duration-150 hover:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring"
        >
          <span className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground">
            <FileSpreadsheet className="size-5" aria-hidden="true" />
          </span>
          <span className="text-body font-medium text-foreground">
            Choose an .xlsx file
          </span>
          <span className="text-body text-muted-foreground">
            One row per room, with a room number and a capacity column ("2",
            "Double" and "Two seater" all work).
          </span>
          <input
            id={fileId}
            type="file"
            accept=".xlsx"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-body text-muted-foreground">
            <span className="font-medium text-foreground">{fileName}</span>,{" "}
            {rows.length} rows.
          </p>
          <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
            {(
              [
                ["Room number", roomCol, setRoomCol],
                ["Capacity", capCol, setCapCol],
              ] as const
            ).map(([label, value, set]) => (
              <div key={label} className="flex flex-col gap-1.5">
                <Label htmlFor={`room-map-${label}`}>{label}</Label>
                <Select value={value} onValueChange={set}>
                  <SelectTrigger id={`room-map-${label}`}>
                    <SelectValue placeholder="Pick a column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.filter(Boolean).map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={reset}>
              <RotateCcw aria-hidden="true" />
              Choose another file
            </Button>
            <Button
              variant="primary"
              onClick={() => setReviewing(true)}
              disabled={!roomCol || !capCol}
            >
              Check rows
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <p className="text-body text-foreground">
            {valid.length} rooms ready
            {problems > 0 && (
              <span className="text-destructive">
                , {problems} with problems (skipped)
              </span>
            )}
          </p>
          <TableFrame
            caption="Rooms in the file"
            className="max-h-96 overflow-y-auto"
          >
            <thead>
              <tr>
                <Th className="w-16">Row</Th>
                <Th>Room</Th>
                <Th>Beds</Th>
                <Th>Result</Th>
              </tr>
            </thead>
            <tbody>
              {parsed.slice(0, 300).map((p) => (
                <tr key={p.row} className="group/row">
                  <Td className="tabular-nums text-muted-foreground">
                    {p.row}
                  </Td>
                  <Td className="font-mono">{p.roomNumber || "empty"}</Td>
                  <Td className="tabular-nums">{p.capacity ?? "unknown"}</Td>
                  <Td>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        p.problem ? "text-destructive" : "text-foreground"
                      )}
                    >
                      {p.problem ? (
                        <CircleAlert className="size-4" aria-hidden="true" />
                      ) : (
                        <CircleCheck
                          className="size-4 text-success"
                          aria-hidden="true"
                        />
                      )}
                      {p.problem ?? "Ready"}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableFrame>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setReviewing(false)}>
              <ArrowLeft aria-hidden="true" />
              Back to columns
            </Button>
            <Button
              variant="primary"
              onClick={commit}
              disabled={busy || valid.length === 0}
            >
              {busy && (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              )}
              Add {valid.length} rooms
            </Button>
          </div>
        </div>
      )}

      {step === 4 && result && (
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-body-lg font-medium text-foreground">
            <CircleCheck className="size-5 text-success" aria-hidden="true" />
            Added {result.added} rooms
          </p>
          {result.skipped.length > 0 && (
            <p className="text-body text-muted-foreground">
              Skipped:{" "}
              {result.skipped
                .slice(0, 20)
                .map((s) => `${s.roomNumber} (${s.reason.toLowerCase()})`)
                .join(", ")}
              {result.skipped.length > 20 &&
                ` and ${result.skipped.length - 20} more`}
            </p>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={reset}>
              Import another file
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
