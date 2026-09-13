import { ATTENDANCE_THRESHOLD } from "~/constants/attendance.personal";

export { ATTENDANCE_THRESHOLD };

export type StandingLevel = "none" | "safe" | "edge" | "below";

export type Standing = {
  level: StandingLevel;
  label: string;
  rate: number | null;
  /** Classes that can be missed while staying at or above the threshold. */
  canMiss: number;
  /** Consecutive classes needed to climb back to the threshold. */
  needed: number;
  advice: string;
};

const classes = (n: number) => `${n} ${n === 1 ? "class" : "classes"}`;

export function getStanding(present: number, total: number): Standing {
  const t = ATTENDANCE_THRESHOLD;
  if (total === 0) {
    return {
      level: "none",
      label: "No classes yet",
      rate: null,
      canMiss: 0,
      needed: 0,
      advice: "Mark your first class to see where you stand.",
    };
  }
  const rate = (present / total) * 100;
  // Integer maths: present / (total + k) >= t / 100 and (present + n) / (total + n) >= t / 100.
  const canMiss = Math.max(0, Math.floor((100 * present - t * total) / t));
  const needed = Math.max(
    0,
    Math.ceil((t * total - 100 * present) / (100 - t))
  );

  if (rate < t) {
    return {
      level: "below",
      label: `Below ${t}%`,
      rate,
      canMiss: 0,
      needed,
      advice: `Attend the next ${classes(needed)} in a row to reach ${t}%.`,
    };
  }
  if (canMiss === 0) {
    return {
      level: "edge",
      label: "At risk",
      rate,
      canMiss,
      needed: 0,
      advice: `Missing the next class drops you below ${t}%.`,
    };
  }
  return {
    level: "safe",
    label: "Safe",
    rate,
    canMiss,
    needed: 0,
    advice: `You can miss ${canMiss} more ${canMiss === 1 ? "class" : "classes"} and stay at ${t}%.`,
  };
}

export const formatRate = (rate: number | null) =>
  rate === null ? "No data" : `${Math.round(rate * 10) / 10}%`;
