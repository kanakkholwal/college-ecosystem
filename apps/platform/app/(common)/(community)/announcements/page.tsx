import { BaseHeroSection } from "@/components/application/base-hero";
import { CATEGORY_LABELS } from "@/components/application/announcements/labels";
import AnnouncementsList, {
  AnnouncementsListSkeleton,
} from "@/components/application/announcements/list";
import { SignalTower } from "@/components/illustrations/signal-tower";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { Check, Plus, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAnnouncements } from "~/actions/common.announcement";
import { getSession } from "~/auth/server";
import { RELATED_FOR_TYPES } from "~/constants/common.announcement";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Campus news, updates and notices posted by students and staff.",
  alternates: { canonical: "/announcements" },
};

type Category = (typeof RELATED_FOR_TYPES)[number];

const isCategory = (value?: string): value is Category =>
  RELATED_FOR_TYPES.includes(value as Category);

export default async function AnnouncementsPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCategory } = await props.searchParams;
  const category = isCategory(rawCategory) ? rawCategory : null;

  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pb-12 md:px-6">
      <BaseHeroSection
        badge="Campus notice board"
        title="What's happening"
        accent="on campus"
        description="Updates on academics, events and workshops. Each post comes down on the date its author set."
      >
        <ButtonLink href="/announcements/create" variant="primary">
          <Plus />
          New announcement
        </ButtonLink>
      </BaseHeroSection>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <nav
          aria-label="Filter by category"
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0"
        >
          <CategoryLink href="/announcements" active={category === null}>
            All
          </CategoryLink>
          {RELATED_FOR_TYPES.map((type) => (
            <CategoryLink
              key={type}
              href={`/announcements?category=${type}`}
              active={category === type}
            >
              {CATEGORY_LABELS[type]}
            </CategoryLink>
          ))}
        </nav>

        <ErrorBoundaryWithSuspense
          key={category ?? "all"}
          fallback={
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
              <span className="grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground dark:bg-background">
                <TriangleAlert className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-body-lg font-medium text-foreground">
                Announcements couldn't load
              </h2>
              <p className="mt-1 text-body text-muted-foreground">
                Refresh the page, or try again in a minute.
              </p>
            </div>
          }
          loadingFallback={<AnnouncementsListSkeleton />}
        >
          <AnnouncementFeed category={category} />
        </ErrorBoundaryWithSuspense>
      </div>
    </div>
  );
}

async function AnnouncementFeed({ category }: { category: Category | null }) {
  const [announcements, session] = await Promise.all([
    getAnnouncements(),
    getSession(),
  ]);

  const now = Date.now();
  // The TTL index only sweeps about once a minute, so expired posts can still come back.
  const visible = announcements
    .filter(
      (a) =>
        (!category || a.relatedFor === category) &&
        (!a.expiresAt || new Date(a.expiresAt).getTime() > now)
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-10 text-center">
        <SignalTower className="max-w-40" />
        <h2 className="mt-6 text-body-lg font-medium text-foreground">
          {category
            ? `No ${CATEGORY_LABELS[category].toLowerCase()} announcements`
            : "No announcements right now"}
        </h2>
        <p className="mt-1 max-w-sm text-body text-muted-foreground">
          New posts show up here as soon as they're published.
        </p>
        {category && (
          <ButtonLink
            href="/announcements"
            variant="outline"
            size="sm"
            className="mt-6"
          >
            See all announcements
          </ButtonLink>
        )}
      </div>
    );
  }

  return (
    <section aria-labelledby="announcements-count" className="flex flex-col gap-4">
      <h2
        id="announcements-count"
        className="border-b border-border pb-3 text-body-lg font-medium text-foreground"
      >
        {visible.length} {visible.length === 1 ? "announcement" : "announcements"}
      </h2>
      <AnnouncementsList announcements={visible} user={session?.user} />
    </section>
  );
}

function CategoryLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border bg-card text-foreground hover:bg-muted dark:bg-background"
      )}
    >
      {active && <Check className="size-4" aria-hidden="true" />}
      {children}
    </Link>
  );
}
