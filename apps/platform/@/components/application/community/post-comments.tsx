"use client";

import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

export function CommentsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-28 w-full rounded-xl" />
      {Array.from({ length: 2 }, (_, i) => (
        <div key={`comment-skeleton-${i.toString()}`} className="flex gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Fuma bundles a Tiptap editor; load it after the post body instead of with it.
const CommentSection = dynamic(
  () =>
    import("@/components/application/comments").then((m) => m.CommentSection),
  { ssr: false, loading: () => <CommentsSkeleton /> }
);

export function PostComments({
  page,
  sessionId,
}: {
  page: string;
  sessionId?: string;
}) {
  return (
    <CommentSection
      id="comment-thread"
      page={page}
      sessionId={sessionId}
      className="w-full"
    />
  );
}
