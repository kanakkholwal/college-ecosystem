import {
  PollCard,
  PollCardSkeleton,
} from "@/components/application/poll/poll-card";
import { PollTabs } from "@/components/application/poll/poll-tabs";
import {
  canManagePoll,
  POLL_TABS,
  type PollTab,
  parsePollTab,
  signInHref,
  toPollView,
} from "@/components/application/poll/utils";
import AdUnit from "@/components/common/adsense";
import { BallotBox } from "@/components/illustrations/ballot-box";
import { TiltedChip } from "@/components/site/sections";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { Lock, LogIn, Plus, TriangleAlert, Vote } from "lucide-react";
import type { Metadata } from "next";
import {
  getClosedPolls,
  getOpenPolls,
  getPollsCreatedByLoggedInUser,
} from "~/actions/common.poll";
import { getSession } from "~/auth/server";
import { orgConfig } from "~/project.config";

export const metadata: Metadata = {
  title: { absolute: "Polls" },
  description:
    "Quick polls from students on campus. Vote and see where everyone stands.",
  alternates: {
    canonical: "/polls",
  },
  keywords: ["NITH Polls", "NITH Voting", "NITH Community Polls"],
};

const loaders = {
  open: getOpenPolls,
  closed: getClosedPolls,
  mine: getPollsCreatedByLoggedInUser,
} as const;

export default async function PollsPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await props.searchParams;
  const tab = parsePollTab(rawTab);
  const heading = POLL_TABS.find((t) => t.value === tab)?.heading;

  return (
    <>
      <header className="grid grid-cols-1 items-center gap-8 border-b border-border py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="flex flex-col items-start">
          <TiltedChip>{orgConfig.shortName} polls</TiltedChip>
          <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
            Ask a question,
            <br />
            <span className="text-primary">let campus decide</span>
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
            Quick polls from students. Pick an answer, vote, and see where
            everyone stands.
          </p>
          <ButtonLink href="/polls/create" variant="primary" className="mt-6">
            <Plus />
            New poll
          </ButtonLink>
        </div>
        <BallotBox className="hidden lg:block" />
      </header>

      <section aria-labelledby="polls-heading" className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="polls-heading"
            className="text-body-lg font-medium text-foreground"
          >
            {heading}
          </h2>
          <PollTabs active={tab} />
        </div>
        {tab === "closed" && (
          <p className="mt-2 text-caption text-muted-foreground">
            Closed polls are removed a week after they end.
          </p>
        )}

        <div className="mt-4">
          <ErrorBoundaryWithSuspense
            key={tab}
            fallback={
              <EmptyState
                icon={<TriangleAlert className="size-6" aria-hidden="true" />}
                title="Polls couldn't load"
                description="The polls service didn't respond. Refresh the page, or try again in a minute."
              />
            }
            loadingFallback={<PollGridSkeleton />}
          >
            <PollFeed tab={tab} />
          </ErrorBoundaryWithSuspense>
        </div>
      </section>

      <div className="mt-10">
        <AdUnit adSlot="display-horizontal" key="polls-page-ad" />
      </div>
    </>
  );
}

async function PollFeed({ tab }: { tab: PollTab }) {
  const [session, polls] = await Promise.all([getSession(), loaders[tab]()]);
  const now = Date.now();

  if (tab === "mine" && !session) {
    return (
      <EmptyState
        icon={<LogIn className="size-6" aria-hidden="true" />}
        title="Sign in to see your polls"
        description="Polls you start show up here, open or closed."
        action={
          <ButtonLink href={signInHref("/polls?tab=mine")} variant="outline">
            <LogIn />
            Sign in
          </ButtonLink>
        }
      />
    );
  }

  if (polls.length === 0) {
    const empty = {
      open: {
        icon: <Vote className="size-6" aria-hidden="true" />,
        title: "No open polls right now",
        description: "Start one and it shows up here for everyone to vote on.",
      },
      closed: {
        icon: <Lock className="size-6" aria-hidden="true" />,
        title: "No closed polls",
        description: "Polls land here once they end, and stay for a week.",
      },
      mine: {
        icon: <Vote className="size-6" aria-hidden="true" />,
        title: "You haven't started a poll",
        description: "Ask a question and see how campus votes.",
      },
    }[tab];
    return (
      <EmptyState
        {...empty}
        action={
          tab === "closed" ? undefined : (
            <ButtonLink href="/polls/create" variant="outline">
              <Plus />
              Start a poll
            </ButtonLink>
          )
        }
      />
    );
  }

  const viewer = session?.user;
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {polls.map((poll) => (
        <li key={String(poll._id)}>
          <PollCard
            poll={toPollView(poll, viewer?.id)}
            now={now}
            signedIn={!!viewer}
            canManage={canManagePoll(viewer, poll.createdBy)}
          />
        </li>
      ))}
    </ul>
  );
}

function PollGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {Array.from({ length: 4 }, (_, i) => (
        <PollCardSkeleton key={`poll-skeleton-${i.toString()}`} />
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
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
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
