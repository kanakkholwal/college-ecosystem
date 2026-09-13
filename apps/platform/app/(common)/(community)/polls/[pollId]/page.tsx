import {
  AuthorAvatar,
  RelativeTime,
} from "@/components/application/community/post-card";
import { PostComments } from "@/components/application/community/post-comments";
import { PollMenu } from "@/components/application/poll/poll-menu";
import { PollStatus } from "@/components/application/poll/poll-timer";
import { PollVoter } from "@/components/application/poll/poll-voter";
import {
  canManagePoll,
  formatPollDate,
  formatVotes,
  toPollView,
} from "@/components/application/poll/utils";
import AdUnit from "@/components/common/adsense";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getPollById } from "~/actions/common.poll";
import { getSession } from "~/auth/server";

interface Props {
  params: Promise<{ pollId: string }>;
}

// Metadata and the page share one read per request.
const loadPoll = cache((id: string) => getPollById(id));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pollId } = await params;
  const poll = await loadPoll(pollId);
  if (!poll) return { title: "Poll not found" };

  const description =
    poll.description?.trim().slice(0, 160) ||
    `Vote on "${poll.question}" and see where campus stands.`;
  return {
    title: poll.question,
    description,
    alternates: { canonical: `/polls/${pollId}` },
    openGraph: {
      type: "website",
      title: poll.question,
      description,
    },
  };
}

export default async function PollPage({ params }: Props) {
  const { pollId } = await params;
  const [poll, session] = await Promise.all([loadPoll(pollId), getSession()]);
  if (!poll) notFound();

  const now = Date.now();
  const viewer = session?.user;
  const view = toPollView(poll, viewer?.id);
  const closed = new Date(view.closesAt).getTime() <= now;

  return (
    <div className="mx-auto w-full max-w-3xl pt-6">
      <ButtonLink
        href={closed ? "/polls?tab=closed" : "/polls"}
        variant="ghost"
        size="sm"
        className="mb-6 w-fit text-muted-foreground"
      >
        <ArrowLeft />
        All polls
      </ButtonLink>

      <article aria-labelledby="poll-title">
        <header className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <AuthorAvatar name={view.createdBy} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/u/${view.createdBy}`}
                className="block truncate text-body font-medium text-foreground hover:underline"
              >
                @{view.createdBy}
              </Link>
              <p className="text-caption text-muted-foreground">
                Asked <RelativeTime date={view.createdAt} />
              </p>
            </div>
            <PollStatus closesAt={view.closesAt} now={now} />
            <PollMenu
              pollId={view.id}
              question={view.question}
              canManage={canManagePoll(viewer, view.createdBy)}
              className="-mr-2"
            />
          </div>
          <div>
            <h1
              id="poll-title"
              className="text-balance text-heading-sm font-medium text-foreground md:text-heading-lg"
            >
              {view.question}
            </h1>
            {view.description && (
              <p className="mt-3 text-pretty text-body leading-relaxed wrap-break-word whitespace-pre-line text-muted-foreground md:text-body-lg">
                {view.description}
              </p>
            )}
          </div>
        </header>

        <section
          aria-label={closed ? "Final results" : "Vote"}
          className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6 dark:bg-background"
        >
          <PollVoter poll={view} now={now} signedIn={!!viewer} detailed />
        </section>

        <details className="group mt-3 rounded-2xl border border-border bg-card dark:bg-background">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 text-body font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6 [&::-webkit-details-marker]:hidden">
            Poll details
            <ChevronDown
              className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 border-t border-border px-4 py-4 text-body sm:grid-cols-2 sm:px-6">
            <Detail label="Answer type">
              {view.multipleChoice ? "Multiple choice" : "Single choice"}
            </Detail>
            <Detail label="Voters">{formatVotes(view.voters)}</Detail>
            <Detail label="Opened">{formatPollDate(view.createdAt)}</Detail>
            <Detail label={closed ? "Closed" : "Closes"}>
              {formatPollDate(view.closesAt)}
            </Detail>
            <Detail label="Visibility">
              Results show after voting or once the poll closes
            </Detail>
            <Detail label="Kept until">
              A week after closing, then removed
            </Detail>
          </dl>
        </details>
      </article>

      <section
        id="comments"
        aria-labelledby="comments-heading"
        className="mt-10 scroll-mt-6"
      >
        <h2
          id="comments-heading"
          className="mb-4 text-heading-sm font-medium text-foreground"
        >
          Discussion
        </h2>
        <PostComments
          page={`community.polls.${view.id}`}
          sessionId={session?.session.id}
        />
      </section>

      <div className="mt-12">
        <AdUnit adSlot="display-horizontal" key={`poll-page-ad-${view.id}`} />
      </div>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
