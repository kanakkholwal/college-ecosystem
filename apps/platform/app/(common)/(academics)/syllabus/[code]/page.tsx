import { CourseBooks } from "@/components/illustrations/course-books";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ButtonLink } from "@/components/utils/link";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  FileText,
  Library,
  Link2,
  Plus,
  Youtube,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCourseByCode } from "~/actions/common.course";
import { getSession } from "~/auth/server";
import type {
  BookReferenceSelect,
  ChapterSelect,
  PreviousPaperSelect,
} from "~/db/schema/course";
import { AddPrevModal, AddRefsModal } from "./modal";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

const TABS = ["curriculum", "resources", "papers"] as const;
type Tab = (typeof TABS)[number];

const EXAM_LABELS: Record<string, string> = {
  midsem: "Mid semester",
  endsem: "End semester",
  others: "Other exam",
};

// generateMetadata and the page both need the course; cache runs its queries once per request.
const getCourse = cache((code: string) => getCourseByCode(code));

/** User-submitted links render only when they are http(s). */
function safeUrl(link: string): URL | null {
  try {
    const url = new URL(link);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const { course } = await getCourse(code);
  if (!course) return { title: "Course not found" };

  return {
    title: `${course.name} (${course.code}) | Syllabus`,
    description: `Modules, books and previous papers for ${course.name}.`,
    alternates: { canonical: `/syllabus/${course.code}` },
  };
}

export default async function CoursePage(props: Props) {
  const [{ code }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const [data, session] = await Promise.all([getCourse(code), getSession()]);
  if (!data.course) notFound();

  const { course, chapters } = data;
  const requestedTab = [searchParams.tab].flat()[0];
  const tab: Tab = TABS.includes(requestedTab as Tab)
    ? (requestedTab as Tab)
    : "curriculum";
  const signedIn = Boolean(session?.user);

  const resources = data.booksAndReferences.flatMap((ref) => {
    const url = safeUrl(ref.link);
    return url ? [{ ...ref, url }] : [];
  });
  const papers = data.previousPapers
    .flatMap((paper) => {
      const url = safeUrl(paper.link);
      return url ? [{ ...paper, url }] : [];
    })
    .sort((a, b) => b.year - a.year);

  const lectures = chapters.reduce((sum, c) => sum + (c.lectures ?? 0), 0);

  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pt-6 pb-16 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-body text-muted-foreground">
          <li>
            <Link
              href="/syllabus"
              className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Syllabus
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" />
          </li>
          <li>
            <Link
              href={{
                pathname: "/syllabus",
                query: { department: course.department },
              }}
              className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {course.department}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" />
          </li>
          <li aria-current="page" className="font-mono text-foreground">
            {course.code}
          </li>
        </ol>
      </nav>

      <header className="flex items-end justify-between gap-8 border-b border-border pb-8">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
            <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-foreground">
              {course.code}
            </span>
            <span className="capitalize">{course.type} course</span>
          </p>
          <h1 className="mt-3 text-balance text-heading-lg font-medium text-foreground md:text-display">
            {course.name}
          </h1>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-body">
            <Meta label="Credits" value={course.credits} />
            <Meta label="Modules" value={chapters.length} />
            {lectures > 0 && <Meta label="Lectures" value={lectures} />}
            {course.updatedAt && (
              <Meta
                label="Last updated"
                value={new Date(course.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                })}
              />
            )}
          </dl>
        </div>
        <div className="hidden w-48 shrink-0 md:block lg:w-56">
          <CourseBooks />
        </div>
      </header>

      <Tabs defaultValue={tab} className="mt-10 w-full">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="sr-only text-heading-sm font-medium text-foreground sm:not-sr-only">
            Course material
          </h2>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="curriculum" className="gap-1.5">
              <BookOpen className="size-4" aria-hidden="true" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5">
              <Library className="size-4" aria-hidden="true" />
              Books
              <Count n={resources.length} />
            </TabsTrigger>
            <TabsTrigger value="papers" className="gap-1.5">
              <FileText className="size-4" aria-hidden="true" />
              Papers
              <Count n={papers.length} />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="curriculum" className="mt-0 flex flex-col gap-3">
          {chapters.length > 0 ? (
            <ol className="divide-y divide-border rounded-2xl border border-border bg-card dark:bg-background">
              {chapters.map((chapter, i) => (
                <ChapterRow key={chapter.id} chapter={chapter} index={i} />
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={<BookOpen className="size-6" aria-hidden="true" />}
              title="No modules listed yet"
              description="The module breakdown for this course hasn't been added."
            />
          )}
          {course.outcomes.length > 0 && (
            <section
              aria-labelledby="outcomes"
              className="rounded-2xl border border-border bg-card p-5 dark:bg-background"
            >
              <h3
                id="outcomes"
                className="text-body-lg font-medium text-foreground"
              >
                Course outcomes
              </h3>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-body leading-relaxed text-muted-foreground">
                {course.outcomes.map((outcome, i) => (
                  <li key={`${i.toString()}-${outcome}`}>{outcome}</li>
                ))}
              </ul>
            </section>
          )}
        </TabsContent>

        <TabsContent value="resources" className="mt-0 flex flex-col gap-4">
          {resources.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {resources.map((ref) => (
                <li key={ref.id}>
                  <ResourceCard resource={ref} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Library className="size-6" aria-hidden="true" />}
              title="No books or references yet"
              description="Know a good textbook or playlist for this course? Add it for everyone."
            />
          )}
          <Contribute
            label="Missing a book or reference?"
            action={
              signedIn ? (
                <AddRefsModal code={course.code} courseId={course.id} />
              ) : (
                <SignInLink
                  label="Add a resource"
                  next={`/syllabus/${course.code}?tab=resources`}
                />
              )
            }
          />
        </TabsContent>

        <TabsContent value="papers" className="mt-0 flex flex-col gap-4">
          {papers.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {papers.map((paper) => (
                <li key={paper.id}>
                  <PaperCard paper={paper} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<FileText className="size-6" aria-hidden="true" />}
              title="No previous papers yet"
              description="Have a past mid or end semester paper? Share a public link to it."
            />
          )}
          <Contribute
            label="Have a paper that isn't listed?"
            action={
              signedIn ? (
                <AddPrevModal code={course.code} courseId={course.id} />
              ) : (
                <SignInLink
                  label="Add a paper"
                  next={`/syllabus/${course.code}?tab=papers`}
                />
              )
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="rounded-sm bg-muted px-1 text-caption tabular-nums text-muted-foreground">
      {n}
    </span>
  );
}

function ChapterRow({
  chapter,
  index,
}: {
  chapter: ChapterSelect;
  index: number;
}) {
  return (
    <li className="flex items-start gap-4 p-4 sm:p-5">
      <span className="text-body font-semibold tabular-nums text-primary">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-body-lg font-medium text-foreground">
            {chapter.title}
          </h3>
          {typeof chapter.lectures === "number" && chapter.lectures > 0 && (
            <span className="text-caption text-muted-foreground tabular-nums">
              {chapter.lectures}{" "}
              {chapter.lectures === 1 ? "lecture" : "lectures"}
            </span>
          )}
        </div>
        {chapter.topics.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {chapter.topics.map((topic, i) => (
              <li
                key={`${i.toString()}-${topic}`}
                className="rounded-sm bg-muted px-1.5 py-0.5 text-caption text-foreground"
              >
                {topic}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function ResourceCard({
  resource,
}: {
  resource: BookReferenceSelect & { url: URL };
}) {
  const type = resource.type.toLowerCase();
  const Icon =
    type === "youtube" || type === "video"
      ? Youtube
      : type === "book"
        ? BookOpen
        : Link2;
  return (
    <a
      href={resource.url.href}
      target="_blank"
      rel="noopener noreferrer nofollow ugc"
      className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-4 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring dark:bg-background"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="line-clamp-2 text-body font-medium text-foreground">
          {resource.name}
        </span>
        <span className="mt-1 flex min-w-0 items-center gap-2 text-caption text-muted-foreground">
          <span className="capitalize">{resource.type}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">
            {resource.url.hostname.replace(/^www\./, "")}
          </span>
        </span>
      </span>
      <ArrowUpRight
        className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function PaperCard({ paper }: { paper: PreviousPaperSelect & { url: URL } }) {
  return (
    <a
      href={paper.url.href}
      target="_blank"
      rel="noopener noreferrer nofollow ugc"
      className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-4 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring dark:bg-background"
    >
      <span className="grid h-10 shrink-0 place-items-center rounded-lg border border-border px-2 font-mono text-body font-medium tabular-nums text-foreground">
        {paper.year}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-body font-medium text-foreground">
          {EXAM_LABELS[paper.exam] ?? paper.exam}
        </span>
        <span className="truncate text-caption text-muted-foreground">
          {paper.url.hostname.replace(/^www\./, "")}
        </span>
      </span>
      <ArrowUpRight
        className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function Contribute({
  label,
  action,
}: {
  label: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border px-5 py-4">
      <p className="text-body text-muted-foreground">{label}</p>
      {action}
    </div>
  );
}

function SignInLink({ label, next }: { label: string; next: string }) {
  return (
    <ButtonLink
      href={`/auth/sign-in?next=${encodeURIComponent(next)}`}
      variant="outline"
      size="sm"
    >
      <Plus />
      {label}
    </ButtonLink>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex w-full flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-xl border border-border bg-card text-foreground dark:bg-background">
        {icon}
      </span>
      <h3 className="mt-4 text-body-lg font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-body text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
