import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPollById, updateVotes } from "src//actions/common.poll";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { PollRender } from "../components/poll-component";
import Polling from "./polling";

import AdUnit from "@/components/common/adsense";
import EmptyArea from "@/components/common/empty-area";
import { AuthButtonLink } from "@/components/utils/link";
import type { Metadata } from "next";
import { appConfig } from "~/project.config";
import { ClosingBadge } from "../components/poll-timer";

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

export default async function Dashboard({ params }: Props) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  const { pollId } = await params;
  const poll = await getPollById(pollId);
  if (!poll) {
    return notFound();
  }
  // console.log(poll);

  const closesAlready = new Date(poll.closesAt) < new Date();

  return (
    <div className="max-w-6xl mx-auto w-full grid justify-start items-start gap-4 grid-cols-1 px-2 lg:px-4 pr-4">
      <div className="md:sticky md:top-4 mt-4 z-50 w-full mx-1.5 lg:mx-auto flex justify-between items-center gap-2 bg-card px-2 lg:px-4 py-1 lg:py-2 rounded-lg border">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/polls">
            <ArrowLeft />
            Back to Polls
          </Link>
        </Button>
      </div>
      <div className="w-full flex flex-col justify-start whitespace-nowrap gap-2 bg-card border rounded-lg p-4 lg:px-6">
        <div>
          <h3 className="text-lg font-semibold">{poll.question}</h3>
          <p className="text-sm text-muted-foreground">{poll.description}</p>
        </div>
        <div className="gap-3 flex flex-wrap items-center">
          <span className="rounded-md bg-muted text-muted-foreground px-2 py-1 text-xs inline-flex items-center">
            <Info className="mr-1 inline-block size-3" />
            {poll.multipleChoice ? "Multiple choice" : "Single choice"}
          </span>
          <span className="rounded-md bg-muted text-muted-foreground px-2 py-1 text-xs inline-flex items-center">
            <Clock className="mr-1 inline-block size-3" />
            <ClosingBadge poll={poll} />
          </span>
          {closesAlready && (
            <Badge variant="destructive_light">Poll closed</Badge>
          )}
        </div>
        {closesAlready ? (
          <PollRender poll={poll} />
        ) : session?.user ? (
          <Polling
            poll={poll}
            user={session.user}
            updateVotes={updateVotes.bind(null, poll._id)}
          />
        ) : (
          <EmptyArea
            title="You need to be logged in to vote on this poll"
            description="Please login to cast your vote."
            actionProps={{
              asChild: true,
              variant: "raw",
              children: (
                <AuthButtonLink
                  href={"/polls/" + poll._id}
                  authorized={!!session?.user}
                  variant="rainbow"
                  size="sm"
                >
                  Login
                </AuthButtonLink>
              ),
            }}
          />
        )}
      </div>
      <AdUnit
        adSlot="display-horizontal"
        key={`polls-page-ad-${poll._id}`}
      />
    </div>
  );
}
