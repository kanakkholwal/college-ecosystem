"use client";
import { formatDuration, intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";
import type { PollType } from "src/models/poll";

export const ClosingBadge = ({ poll }: { poll: PollType }) => {
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    const calculateRemainingTime = () => {
      const now = new Date();
      const closesAt = new Date(poll.closesAt);
      // const timeDifference = closesAt.getTime() - now.getTime();
      if (closesAt > now) {
        const duration = intervalToDuration({ start: now, end: closesAt });
        const formattedDuration = formatDuration(duration, {
          format: ["months", "days", "hours", "minutes", "seconds"],
          delimiter: ", ",
        });
        setRemainingTime(formattedDuration);
      } else {
        setRemainingTime("Closed");
      }
    };

    calculateRemainingTime();
    const intervalId = setInterval(calculateRemainingTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, [poll.closesAt]);

  return remainingTime === "Closed" ? "Closed" : `Closing in: ${remainingTime}`;
};
