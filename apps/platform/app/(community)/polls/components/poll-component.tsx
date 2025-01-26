import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PollType } from "src/models/poll";
import type { Session } from "src/lib/auth-client";
import DeletePoll from "./delete-poll";
import { ClosingBadge } from "./poll-timer";

export default function PollComponent({
  poll,
  user,
}: {
  poll: PollType;
  user?: Session["user"];
}) {
  const closesAlready = new Date(poll.closesAt) < new Date();

  return (
    <div className="bg-white/10 p-4 rounded-lg mt-2 flex flex-col justify-between items-stretch gap-3 border border-gray-50/40 hover:shadow-xs">
      <div className="flex justify-between items-center gap-3 w-full">
        <h3 className="text-lg font-semibold">{poll.question}</h3>
      </div>
      <p className="text-sm">{poll.description}</p>
      <PollRender poll={poll} />
      <div className="w-full flex items-center gap-2">
        <ClosingBadge poll={poll} />
        <Badge variant="info_light">{poll.votes.length} votes</Badge>
      </div>
      <div className="w-full flex items-center justify-end gap-2">
        {user?.id === poll.createdBy && <DeletePoll pollId={poll._id} />}
        {!closesAlready && (
          <Button variant="link" size="sm" asChild>
            <Link href={`/polls/${poll._id}`}>
              Vote
              <ArrowRight />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
export function PollRender({ poll }: { poll: PollType }) {
  return (
    <div className="flex justify-between space-x-6 mx-auto max-w-sm w-full">
      <div className="relative w-full space-y-1.5">
        {poll.options.map((option, index) => (
          <div
            key={option.concat(index.toString())}
            className="group w-full flex items-center rounded-sm bg-white/20"
          >
            <div
              className="flex items-center rounded transition-all bg-opacity-40 h-8 bg-primary/20"
              style={{ width: `${parseVotes(poll.votes, option).percent}%` }}
            >
              <div className="absolute left-2 pr-4 flex max-w-full">
                <p className="whitespace-nowrap truncate text-sm font-semibold text-gray-700">
                  {option}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div>
        {poll.options.map((option, index) => (
          <div
            key={option}
            className="flex justify-end items-center h-8 mb-1.5"
          >
            <p className="whitespace-nowrap leading-none truncate text-sm font-semibold">
              {parseVotes(poll.votes, option).percent.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
function parseVotes(votes: PollType["votes"], option: string) {
  const count = votes?.filter((vote) => vote.option === option).length || 0;
  const percent = votes && votes.length > 0 ? (count / votes.length) * 100 : 0;
  return { option, count, percent };
}
