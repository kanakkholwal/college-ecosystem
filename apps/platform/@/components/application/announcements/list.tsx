import { ROLES_ENUMS } from "~/constants";
import { UserPreview } from "@/components/application/user-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { campusFormat } from "@/components/application/hostel/ui";
import {
  CalendarDays,
  Cpu,
  Droplet,
  GraduationCap,
  Info,
  type LucideIcon,
  Music,
  Wrench,
} from "lucide-react";
import Markdown, { type Components } from "react-markdown";
import type { AnnouncementTypeWithId } from "src/models/announcement";
import type { Session } from "~/auth/client";
import DeleteButton from "./delete-btn";
import {
  type AnnouncementCategory as Category,
  CATEGORY_LABELS,
} from "./labels";

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  academics: GraduationCap,
  events: CalendarDays,
  culturalEvents: Music,
  techEvents: Cpu,
  workshops: Wrench,
  bloodDonation: Droplet,
  others: Info,
};

const heading: Components["h1"] = ({ children }) => (
  <p className="mb-1 font-medium text-foreground">{children}</p>
);

const markdownComponents: Components = {
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-primary underline-offset-4 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};

export default function AnnouncementsList({
  announcements,
  user,
}: {
  announcements: AnnouncementTypeWithId[];
  user?: Session["user"];
}) {
  return (
    <ul className="flex flex-col gap-3">
      {announcements.map((announcement) => {
        const category = announcement.relatedFor as Category;
        const CategoryIcon = CATEGORY_ICONS[category] ?? Info;
        const createdAt = new Date(announcement.createdAt);
        const canDelete =
          !!user &&
          (announcement.createdBy.id === user.id ||
            user.role === ROLES_ENUMS.ADMIN);

        return (
          <li key={announcement._id}>
            <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-2">
                  <p className="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
                    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border px-2 font-medium text-foreground">
                      <CategoryIcon className="size-3.5" aria-hidden="true" />
                      {CATEGORY_LABELS[category] ?? announcement.relatedFor}
                    </span>
                    <time
                      dateTime={createdAt.toISOString()}
                      title={campusFormat(createdAt, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    >
                      {formatDistanceToNow(createdAt, { addSuffix: true })}
                    </time>
                  </p>
                  <h3 className="text-body-lg font-medium text-foreground">
                    {announcement.title}
                  </h3>
                </div>
                {canDelete && (
                  <DeleteButton announcementId={announcement._id} />
                )}
              </div>

              <div className="wrap-break-word text-body leading-relaxed text-muted-foreground">
                <Markdown components={markdownComponents}>
                  {announcement.content}
                </Markdown>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-caption text-muted-foreground">
                <UserPreview user={announcement.createdBy}>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-6 place-items-center rounded-full border border-border bg-muted text-caption font-medium"
                    >
                      {announcement.createdBy.name.charAt(0)}
                    </span>
                    {announcement.createdBy.name}
                  </button>
                </UserPreview>
                {announcement.expiresAt && (
                  <span>
                    Up until{" "}
                    <time
                      dateTime={new Date(announcement.expiresAt).toISOString()}
                    >
                      {campusFormat(announcement.expiresAt, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </span>
                )}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

export function AnnouncementsListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="h-7 w-40" />
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={`announcement-skeleton-${i.toString()}`}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex justify-between border-t border-border pt-4">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
