"use client";

import { CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyNote } from "@/components/application/dashboard/primitives";
import { OutpassActionFooter } from "@/components/application/hostel/outpass-actions";
import {
  REASON_LABEL,
  shortDateTime,
} from "@/components/application/hostel/ui";
import type { OutpassQueueItem } from "~/actions/hostel.outpass";

export function OutpassQueue({ items }: { items: OutpassQueueItem[] }) {
  const router = useRouter();
  const [decided, setDecided] = useState<Set<string>>(new Set());
  const open = items.filter((item) => !decided.has(item._id));

  if (open.length === 0) {
    return (
      <EmptyNote
        icon={<CircleCheck />}
        title="Queue is clear"
        description="New requests from residents appear here, oldest first."
      />
    );
  }

  return (
    <ol className="flex flex-col gap-3" aria-label="Pending outpass requests">
      {open.map((item, index) => (
        <li
          key={item._id}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background @3xl:flex-row @3xl:items-center @3xl:justify-between"
        >
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-caption tabular-nums text-muted-foreground">
                #{index + 1}
              </span>
              <h3 className="truncate text-body-lg font-medium text-foreground">
                {item.student?.name ?? "Unknown student"}
              </h3>
              <span className="font-mono text-caption text-muted-foreground">
                {item.student?.rollNumber ?? "No roll number"}, room{" "}
                {item.roomNumber}
              </span>
            </div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-body @xl:grid-cols-3">
              <div className="flex gap-1.5">
                <dt className="text-muted-foreground">Reason</dt>
                <dd className="font-medium text-foreground">
                  {REASON_LABEL[item.reason] ?? item.reason}
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-muted-foreground">Out</dt>
                <dd className="tabular-nums text-foreground">
                  {shortDateTime(item.expectedOutTime)}
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-muted-foreground">Back by</dt>
                <dd className="tabular-nums text-foreground">
                  {shortDateTime(item.expectedInTime)}
                </dd>
              </div>
              <div className="flex min-w-0 gap-1.5 @xl:col-span-3">
                <dt className="shrink-0 text-muted-foreground">Going to</dt>
                <dd className="truncate text-foreground" title={item.address}>
                  {item.address}
                </dd>
              </div>
            </dl>
            <p className="text-caption text-muted-foreground">
              Requested {shortDateTime(item.createdAt)}
            </p>
          </div>
          <OutpassActionFooter
            outpassId={item._id}
            studentName={item.student?.name}
            className="shrink-0"
            onDone={() => {
              setDecided((prev) => new Set(prev).add(item._id));
              router.refresh();
            }}
          />
        </li>
      ))}
    </ol>
  );
}
