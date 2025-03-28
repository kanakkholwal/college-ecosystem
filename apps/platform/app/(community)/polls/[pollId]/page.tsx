import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "src/lib/auth-server";
import { getPollById, updateVotes } from "src/lib/poll/actions";
import { PollRender } from "../components/poll-component";
import Polling from "./polling";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pollId: string }>;
}): Promise<Metadata> {
  const { pollId } = await params;
  const poll = await getPollById(pollId);

  if (!poll) return notFound();

  return {
    title: `${poll.question}`,
    description: `${poll?.description?.substring(0, 160)}...`,
    openGraph: {
      type: "website",
      title: `${poll.question}`,
      description: `${poll?.description?.substring(0, 160)}...`,
      siteName: process.env.NEXTAUTH_URL,
      url: `${process.env.NEXTAUTH_URL}/polls/${pollId}`,
    },
  };
}

interface Props {
  params: Promise<{
    pollId: string;
  }>;
}

export default async function Dashboard({ params }: Props) {
  const session = await getSession();
  const { pollId } = await params;
  const poll = await getPollById(pollId);
  if (!poll) {
    return notFound();
  }
  console.log(poll);

  const closesAlready = new Date(poll.closesAt) < new Date();

  return (
    <>
      <Button className="my-5" variant="default_light" size="sm" asChild>
        <Link href="/polls">
          <ArrowLeft />
          Back to Polls
        </Link>
      </Button>
      <div className="w-full flex flex-col justify-start whitespace-nowrap gap-2 bg-white/20 backdrop-blur-lg rounded-lg p-6">
        <h3 className="text-xl font-semibold">{poll.question}</h3>
        <p>{poll.description}</p>
        <p className="space-x-3">
          <Badge variant="info_light">
            {poll.multipleChoice ? "Multiple choice" : "Single choice"}
          </Badge>
          {closesAlready && (
            <Badge variant="destructive_light">Poll closed</Badge>
          )}
        </p>
        {closesAlready ? (
          <PollRender poll={poll} />
        ) : (
          session?.user && (
            <Polling
              poll={poll}
              user={session.user}
              updateVotes={updateVotes.bind(null, poll._id)}
            />
          )
        )}
      </div>
    </>
  );
}
