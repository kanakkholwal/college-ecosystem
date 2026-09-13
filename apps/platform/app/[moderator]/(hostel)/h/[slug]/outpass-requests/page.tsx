import { Tickets } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  PanelSkeleton,
  SectionError,
} from "@/components/application/dashboard/primitives";
import { OUTPASS_STATUS_META } from "@/components/application/hostel/ui";
import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { getOutpassQueue } from "~/actions/hostel.outpass";
import { OUTPASS_STATUS } from "~/constants/hostel.outpass";
import { OutpassQueue } from "./queue";

export default async function OutpassRequestsPage({
  params,
}: {
  params: Promise<{ moderator: string; slug: string }>;
}) {
  const { moderator, slug } = await params;
  const base = `/${moderator}/h/${slug}`;

  return (
    <div className="@container flex flex-col gap-6">
      <HeaderBar
        Icon={Tickets}
        titleNode="Outpass requests"
        descriptionNode="Approve or reject pending requests, oldest first. Decided passes move to the logs."
        actionNode={
          <ButtonLink href={`${base}/outpass-logs`} variant="outline">
            Open logs
          </ButtonLink>
        }
      />
      <Suspense fallback={<QueueSkeleton />}>
        <QueueSection slug={slug} base={base} />
      </Suspense>
    </div>
  );
}

async function QueueSection({ slug, base }: { slug: string; base: string }) {
  const res = await getOutpassQueue(slug);
  if (!res.success) return <SectionError what="Outpass requests" />;
  const { counts, pending } = res;

  return (
    <>
      <nav aria-label="Outpasses by status">
        <ul className="flex flex-wrap gap-2">
          {OUTPASS_STATUS.map((status) => {
            const meta = OUTPASS_STATUS_META[status];
            const isQueue = status === "pending";
            return (
              <li key={status}>
                <Link
                  href={
                    isQueue ? "#queue" : `${base}/outpass-logs?status=${status}`
                  }
                  aria-current={isQueue ? "true" : undefined}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-body outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-[current]:border-primary aria-[current]:bg-primary/10 dark:bg-background"
                >
                  <meta.Icon
                    className={`size-4 ${meta.tone}`}
                    aria-hidden="true"
                  />
                  <span className="text-foreground">{meta.label}</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {counts[status].toLocaleString("en-IN")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section
        id="queue"
        aria-labelledby="queue-heading"
        className="flex flex-col gap-3"
      >
        <h2
          id="queue-heading"
          className="text-subheading font-medium text-foreground"
        >
          {counts.pending === 0
            ? "Nothing waiting"
            : `${counts.pending.toLocaleString("en-IN")} waiting for you`}
        </h2>
        {counts.pending > pending.length && (
          <p className="text-body text-muted-foreground">
            Showing the oldest {pending.length}. Clear these to load more.
          </p>
        )}
        <OutpassQueue items={pending} />
      </section>
    </>
  );
}

function QueueSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading requests</span>
      <div className="flex flex-wrap gap-2">
        {OUTPASS_STATUS.map((s) => (
          <div
            key={s}
            className="h-10 w-28 rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
      <PanelSkeleton rows={4} />
    </div>
  );
}
