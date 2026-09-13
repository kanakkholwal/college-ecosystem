"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { useEffect, useState } from "react";
import type { PollType } from "src/models/poll";

const label = (closesAt: Date) =>
  closesAt.getTime() <= Date.now()
    ? "Closed"
    : `Closes in ${formatDistanceToNowStrict(closesAt)}`;

/** Time left on a poll, refreshed every 15s; the text is coarse, so a per-second tick only burned renders. */
export const ClosingBadge = ({
  poll,
}: {
  poll: Pick<PollType, "closesAt">;
}) => {
  const closesAtMs = new Date(poll.closesAt).getTime();
  const [text, setText] = useState(() => label(new Date(closesAtMs)));

  useEffect(() => {
    const update = () => setText(label(new Date(closesAtMs)));
    update();
    if (closesAtMs <= Date.now()) return;
    const id = setInterval(update, 15_000);
    return () => clearInterval(id);
  }, [closesAtMs]);

  return <span suppressHydrationWarning>{text}</span>;
};
