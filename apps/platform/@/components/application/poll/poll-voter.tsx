"use client";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, CircleCheck, Loader2, LogIn } from "lucide-react";
import { useId, useOptimistic, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { castVote } from "~/actions/common.poll";
import { useNow } from "./poll-timer";
import {
  formatVotes,
  type PollView,
  pollHref,
  signInHref,
  timeLeftLabel,
  votePercent,
} from "./utils";

type PollVoterProps = {
  poll: PollView;
  /** Server request time in ms; keeps the first client render identical to the HTML. */
  now: number;
  signedIn: boolean;
  /** Options shown before a "Show more" toggle. Omit to show all. */
  collapseAfter?: number;
  /** Detail view adds per-option vote counts and a note that votes are final. */
  detailed?: boolean;
  className?: string;
};

/** Select, then Vote; the result bars appear instantly and roll back if the server refuses. */
export function PollVoter({
  poll,
  now,
  signedIn,
  collapseAfter,
  detailed = false,
  className,
}: PollVoterProps) {
  const groupId = useId();
  const time = useNow(now);
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [view, applyVote] = useOptimistic(poll, (state, choices: string[]) => ({
    ...state,
    voters: state.voters + 1,
    myVotes: choices,
    options: state.options.map((option) =>
      choices.includes(option.label)
        ? { ...option, votes: option.votes + 1 }
        : option
    ),
  }));

  const timeLeft = timeLeftLabel(view.closesAt, time);
  const closed = timeLeft === "Closed";
  const voted = view.myVotes.length > 0;
  const showResults = voted || closed;

  const limit =
    collapseAfter && !expanded && view.options.length > collapseAfter + 1
      ? collapseAfter
      : view.options.length;
  const visible = view.options.slice(0, limit);
  const hiddenCount = view.options.length - visible.length;
  const topVotes = Math.max(0, ...view.options.map((o) => o.votes));

  function toggle(label: string) {
    setSelected((current) => {
      if (!view.multipleChoice) return [label];
      return current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label];
    });
  }

  function submit() {
    if (selected.length === 0 || pending) return;
    const choices = selected;
    startTransition(async () => {
      applyVote(choices);
      try {
        const result = await castVote(view.id, choices);
        if (result.ok) setSelected([]);
        else toast.error(result.error);
      } catch {
        toast.error("Couldn't record your vote. Try again.");
      }
    });
  }

  const meta = (
    <p className="text-caption text-muted-foreground tabular-nums">
      {formatVotes(view.voters)}
      <span aria-hidden="true"> · </span>
      {closed ? "Final results" : timeLeft}
    </p>
  );

  return (
    <div className={cn("relative z-10 flex flex-col gap-3", className)}>
      {showResults ? (
        <ul className="flex flex-col gap-2" aria-label="Results">
          {visible.map((option) => {
            const percent = votePercent(option.votes, view.voters);
            const mine = view.myVotes.includes(option.label);
            const leading = option.votes > 0 && option.votes === topVotes;
            return (
              <li
                key={option.label}
                className="relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl border border-border px-3 py-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-0 left-0 transition-[width] duration-500 ease-craft motion-reduce:transition-none",
                    leading ? "bg-primary/10" : "bg-muted"
                  )}
                  style={{ width: `${percent}%` }}
                />
                <span className="relative flex min-w-0 flex-1 flex-col">
                  <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                    {mine && (
                      <CircleCheck
                        className="size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={cn(
                        "min-w-0 text-body wrap-break-word text-foreground",
                        (mine || leading) && "font-medium"
                      )}
                    >
                      {option.label}
                    </span>
                    {mine && (
                      <span className="text-caption font-medium text-primary">
                        Your vote
                      </span>
                    )}
                  </span>
                  {detailed ? (
                    <span className="text-caption text-muted-foreground tabular-nums">
                      {formatVotes(option.votes)}
                    </span>
                  ) : (
                    <span className="sr-only">
                      , {formatVotes(option.votes)}
                    </span>
                  )}
                </span>
                <span className="relative shrink-0 text-body font-medium text-foreground tabular-nums">
                  {percent}%
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <fieldset disabled={pending} className="flex min-w-0 flex-col gap-2">
          <legend className="mb-2 text-caption text-muted-foreground">
            {view.multipleChoice ? "Choose one or more" : "Choose one"}
          </legend>
          {visible.map((option) => {
            const checked = selected.includes(option.label);
            return (
              <label
                key={option.label}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-body transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring has-disabled:cursor-default",
                  checked
                    ? "border-primary bg-primary/5 font-medium text-foreground"
                    : "border-border text-foreground hover:border-border-strong hover:bg-muted"
                )}
              >
                <input
                  type={view.multipleChoice ? "checkbox" : "radio"}
                  name={groupId}
                  value={option.label}
                  checked={checked}
                  onChange={() => toggle(option.label)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-5 shrink-0 place-items-center border transition-colors duration-150",
                    view.multipleChoice ? "rounded-sm" : "rounded-full",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground bg-card dark:bg-background"
                  )}
                >
                  {checked &&
                    (view.multipleChoice ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : (
                      <span className="size-2 rounded-full bg-primary-foreground" />
                    ))}
                </span>
                <span className="min-w-0 flex-1 wrap-break-word">
                  {option.label}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      {(hiddenCount > 0 || expanded) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit text-muted-foreground"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
        >
          <ChevronDown
            className={cn(
              "transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
          {expanded
            ? "Show fewer options"
            : `Show ${hiddenCount} more ${hiddenCount === 1 ? "option" : "options"}`}
        </Button>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {meta}
        {!showResults &&
          (signedIn ? (
            <Button
              type="button"
              variant="primary"
              onClick={submit}
              disabled={selected.length === 0 || pending}
              className="w-full sm:w-auto sm:min-w-28"
            >
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "Voting..." : "Vote"}
            </Button>
          ) : (
            <ButtonLink
              href={signInHref(pollHref(view.id))}
              variant="primary"
              className="w-full sm:w-auto"
            >
              <LogIn />
              Sign in to vote
            </ButtonLink>
          ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {voted ? "Your vote is in. Results are shown." : ""}
      </p>

      {detailed && !showResults && (
        <p className="text-caption text-muted-foreground">
          Results show after you vote. Votes can't be changed.
        </p>
      )}
    </div>
  );
}
