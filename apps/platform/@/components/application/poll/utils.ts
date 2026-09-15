import { ROLES_ENUMS } from "~/constants";
import type { PollType } from "~/models/poll";

/** A poll as the UI needs it: tallies instead of raw votes, so voter ids never reach the client. */
export type PollView = {
  id: string;
  question: string;
  description: string;
  options: { label: string; votes: number }[];
  voters: number;
  multipleChoice: boolean;
  closesAt: string;
  createdAt: string;
  createdBy: string;
  myVotes: string[];
};

export type PollTab = "open" | "closed" | "mine";

export const POLL_TABS: { value: PollTab; label: string; heading: string }[] = [
  { value: "open", label: "Open", heading: "Open polls" },
  { value: "closed", label: "Closed", heading: "Closed polls" },
  { value: "mine", label: "Yours", heading: "Your polls" },
];

export function parsePollTab(value?: string | null): PollTab {
  if (value === "closed" || value === "closed-polls") return "closed";
  if (value === "mine" || value === "your-polls") return "mine";
  return "open";
}

export function pollsHref(tab: PollTab = "open") {
  return tab === "open" ? "/polls" : `/polls?tab=${tab}`;
}

export function pollHref(id: string) {
  return `/polls/${id}`;
}

export function signInHref(next: string) {
  return `/auth/sign-in?next=${encodeURIComponent(next)}`;
}

type Viewer =
  | { username?: string | null; role?: string | null }
  | null
  | undefined;

/** Authors delete their own polls; admins delete any. Mirrors the check in `deletePoll`. */
export function canManagePoll(viewer: Viewer, createdBy: string) {
  return !!viewer && (viewer.username === createdBy || viewer.role === ROLES_ENUMS.ADMIN);
}

export function toPollView(poll: PollType, viewerId?: string | null): PollView {
  const counts = new Map<string, number>();
  const voters = new Set<string>();
  const mine = new Set<string>();
  (poll.votes ?? []).forEach((vote, index) => {
    counts.set(vote.option, (counts.get(vote.option) ?? 0) + 1);
    // Old votes may lack a userId; count each of those as its own voter.
    voters.add(vote.userId ?? `anonymous-${index}`);
    if (viewerId && vote.userId === viewerId) mine.add(vote.option);
  });

  return {
    id: String(poll._id),
    question: poll.question,
    description: poll.description ?? "",
    options: poll.options.map((label) => ({
      label,
      votes: counts.get(label) ?? 0,
    })),
    voters: voters.size,
    multipleChoice: !!poll.multipleChoice,
    closesAt: new Date(poll.closesAt).toISOString(),
    createdAt: new Date(poll.createdAt).toISOString(),
    createdBy: poll.createdBy,
    myVotes: [...mine],
  };
}

/** Share of voters who picked an option; multiple-choice shares can sum past 100. */
export function votePercent(votes: number, voters: number) {
  return voters > 0 ? Math.round((votes / voters) * 100) : 0;
}

export function formatVotes(count: number) {
  return `${count} ${count === 1 ? "vote" : "votes"}`;
}

/** Coarse time left; pure so server HTML and the hydrating client agree given the same `now`. */
export function timeLeftLabel(closesAt: string | Date, now: number) {
  const ms = new Date(closesAt).getTime() - now;
  if (ms <= 0) return "Closed";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "Closing now";
  if (minutes < 60) return `${minutes} min left`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} left`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} left`;
}

const dateTime = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

/** Absolute date in campus time. Server-only: ICU output differs between Node and browsers. */
export function formatPollDate(date: string | Date) {
  return dateTime.format(new Date(date));
}
