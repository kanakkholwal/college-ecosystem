import { PollOptions } from "@/components/application/poll/poll-component";
import Polling from "@/components/application/poll/polling";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MessageSquareText
} from "lucide-react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPollById, updateVotes } from "~/actions/common.poll";
import { auth } from "~/auth";

import { CommentSection } from "@/components/application/comments";
import DeletePoll from "@/components/application/poll/delete-poll";
import { ClosingBadge } from "@/components/application/poll/poll-timer";
import AdUnit from "@/components/common/adsense";
import EmptyArea from "@/components/common/empty-area";
import { HeaderBar } from "@/components/common/header-bar";
import ShareButton from "@/components/common/share-button";
import { AuthButtonLink, ButtonLink } from "@/components/utils/link";
import type { Metadata } from "next";
import { appConfig } from "~/project.config";
import { getBaseURL } from "~/utils/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pollId: string }>;
}): Promise<Metadata> {
  const { pollId } = await params;
  const poll = await getPollById(pollId);

  if (!poll) return notFound();

  return {
    title: poll.question,
    description: poll?.description?.substring(0, 160) + "...",
    openGraph: {
      type: "website",
      title: poll.question,
      description: poll?.description?.substring(0, 160) + "...",
      siteName: appConfig.name,
      url: `${appConfig.url}/polls/${pollId}`,
    },
  };
}

interface Props {
  params: Promise<{
    pollId: string;
  }>;
}

export default async function PollPage({ params }: Props) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  const { pollId } = await params;
  const poll = await getPollById(pollId);
  if (!poll) {
    return notFound();
  }

  const closesAlready = new Date(poll.closesAt) < new Date();

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <ButtonLink
          href="/polls"
          icon="arrow-left"
          variant="glass"
          size="sm"
        >
          Back to all polls
        </ButtonLink>

      </div>
      <HeaderBar
        titleNode={poll.question}
        descriptionNode={<div className="flex items-center gap-6 text-sm text-muted-foreground border-t border-border/50 pt-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>{poll.multipleChoice ? "Multiple Choice" : "Single Choice"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
          </div>
        </div>}
        actionNode={<div className="flex items-center gap-2">
          <DeletePoll pollId={poll._id} className="relative right-auto top-auto" />
          <ShareButton
            data={{
              title: "Share poll",
              text: "Check out this poll!",
              url: `${getBaseURL()}/polls/${poll._id}`,
            }}
            variant="ghost"
            size="sm"
            icon="share"
          >
            Share
          </ShareButton>
        </div>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        <main className="lg:col-span-8 space-y-8">

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {closesAlready ? (
                <Badge variant="destructive_soft">Closed</Badge>
              ) : (
                <Badge variant="success_soft">Active Poll</Badge>
              )}
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <ClosingBadge poll={poll} />
              </span>
            </div>


            {poll.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {poll.description}
              </p>
            )}


          </div>

          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
            {closesAlready ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground pb-4 border-b border-border/50">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Final Results</span>
                </div>
                <PollOptions poll={poll} user={session?.user} />
              </div>
            ) : session?.user ? (
              <Polling
                poll={poll}
                user={session.user}
                updateVotes={updateVotes.bind(null, poll._id)}
              />
            ) : (
              <EmptyArea
                title="Sign in to Vote"
                description="Join the community to cast your vote and see real-time results."
                actionProps={{
                  asChild: true,
                  variant: "default",
                  size: "lg",
                  className: "mt-4 shadow-lg shadow-primary/20",
                  children: (
                    <AuthButtonLink
                      href={"/polls/" + poll._id}
                      authorized={!!session?.user}
                      variant="rainbow"
                    >
                      Login to Vote
                    </AuthButtonLink>
                  ),
                }}
              />
            )}
          </div>

          {/* Ad Unit */}
          <div className="py-4">
            <AdUnit adSlot="display-horizontal" key={`polls-page-ad-${poll._id}`} />
          </div>

        </main>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-card/30 rounded-2xl p-1 border border-border/50 sticky top-4">
            <CommentSection
              page={`community.polls.${poll._id}`}
              sessionId={session?.session.id}
              className="w-full border-none p-4"
              title={
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Discussion
                    </h3>
                    <p className="text-xs text-muted-foreground">Share your thoughts</p>
                  </div>
                </div>
              }
            />
          </div>
        </aside>

      </div>
    </div>
  );
}