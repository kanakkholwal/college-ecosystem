import * as z from "zod";

export const POLL_LIMITS = {
  question: 200,
  description: 500,
  option: 100,
  minOptions: 2,
  maxOptions: 6,
  minMinutes: 5,
  maxDays: 30,
} as const;

/** Index of the first option that repeats an earlier one (case-insensitive), or -1. */
export function duplicateOptionIndex(options: string[]) {
  const seen = new Set<string>();
  return options.findIndex((option) => {
    const key = option.trim().toLowerCase();
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });
}

/** Earliest and latest allowed close times, in ms, relative to `now`. */
export function closeWindow(now: number) {
  return {
    min: now + POLL_LIMITS.minMinutes * 60_000,
    max: now + POLL_LIMITS.maxDays * 86_400_000,
  };
}

/** What `createPoll` accepts; votes and author are always set on the server. */
export const pollInputSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(3, "Ask a question of at least 3 characters.")
      .max(POLL_LIMITS.question),
    description: z.string().trim().max(POLL_LIMITS.description).default(""),
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Options can't be empty.")
          .max(POLL_LIMITS.option)
      )
      .min(POLL_LIMITS.minOptions, "Add at least two options.")
      .max(
        POLL_LIMITS.maxOptions,
        `Use at most ${POLL_LIMITS.maxOptions} options.`
      ),
    multipleChoice: z.boolean().default(false),
    closesAt: z.coerce.date(),
  })
  .superRefine((value, ctx) => {
    // Votes are keyed by option text, so two identical options would share one tally.
    if (duplicateOptionIndex(value.options) > -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Each option must be different.",
      });
    }
    const { min, max } = closeWindow(Date.now());
    const closesAt = value.closesAt.getTime();
    if (Number.isNaN(closesAt) || closesAt < min || closesAt > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closesAt"],
        message: `Pick an end time between ${POLL_LIMITS.minMinutes} minutes and ${POLL_LIMITS.maxDays} days from now.`,
      });
    }
  });

export type PollInput = z.input<typeof pollInputSchema>;
