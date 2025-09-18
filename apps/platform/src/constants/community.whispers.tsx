import { Drama, HatGlasses, Heart, Plus, ShowerHead, VenetianMask } from "lucide-react";
import { FaEarListen, FaRegFaceLaughSquint, FaRegFlag, FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa6";
import { z } from "zod";
// constants
// ~/constants/whisper.constants.ts

export const VISIBILITY_OPTIONS = [
  {
    value: "ANONYMOUS",
    label: "🙈 Anonymous",
    description: "Your identity stays completely hidden.",
  },
  {
    value: "PSEUDO",
    label: "🎭 Pseudo",
    description: "Pick a fun nickname. Keep it safe for campus 🌸",
  },
  {
    value: "IDENTIFIED",
    label: "🪪 Identified",
    description: "Post under your real profile (less common in Whisper).",
  },
] as const;

export type VisibilityType = (typeof VISIBILITY_OPTIONS)[number]["value"];

type CategoryOption = {
  value: string;
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  description: string;
}


export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "confession",
    label: "Confession",
    Icon: Drama,
    description: "Get it off your chest — no judgment here.",
  },
  {
    value: "criticism",
    label: "Criticism",
    Icon: VenetianMask,
    description: "Point out issues, share constructive feedback.",
  },
  {
    value: "praise",
    label: "Praise",
    Icon: FaEarListen,
    description: "Celebrate people, events, or anything wholesome.",
  },
  {
    value: "shower_thought",
    label: "Shower Thought",
    Icon: ShowerHead,
    description: "Random brain dump moments.",
  },
  {
    value: "other",
    label: "Other",
    Icon: HatGlasses,
    description: "Doesn’t fit in a box? Put it here.",
  },
] as const;

export const REACTION_OPTIONS = [
  { value: "like", label: "👍 Like", Icon: Heart },
  { value: "laugh", label: "😂 Laugh", Icon: FaRegFaceLaughSquint },
  { value: "relate", label: "😌 Relatable", Icon: Plus },
  { value: "agree", label: "👌 Agree", Icon: FaRegThumbsUp },
  { value: "disagree", label: "🙅 Disagree", Icon: FaRegThumbsDown },
  { value: "report", label: "🚩 Report", Icon: FaRegFlag },
] as const;

export type ReactionType = (typeof REACTION_OPTIONS)[number]["value"];

export const moderationStatuses: string[] = [
  "PENDING",
  "APPROVED",
  "REMOVED",
  "FLAGGED",
  "REVIEWED",
] as const;
export const postVisibilities = VISIBILITY_OPTIONS.map(v => v.value);
export const postCategories = CATEGORY_OPTIONS.map(c => c.value);
export const postReactions = REACTION_OPTIONS.map(r => r.value);
// zod-schemas


export const PostVisibility = z.enum(postVisibilities as [string, ...string[]]);
export const PostCategory = z.enum(postCategories as [string, ...string[]]);
export const ModerationStatus = z.enum(moderationStatuses as [string, ...string[]]);
export const ReactionType = z.enum(postReactions as [string, ...string[]]);

export const PseudoIdentitySchema = z.object({
  handle: z.string().min(2).max(32),
  avatar: z.string().url().optional(),
  color: z.string().optional(),
});

export const ReactionSchema = z.object({
  userId: z.string().optional(), // from Postgres Session["user"].id
  type: ReactionType,
  createdAt: z.date().optional(),
});

export const ReportSchema = z.object({
  reporterId: z.string().optional(),
  reason: z.string().min(5).max(1000),
  createdAt: z.date().optional(),
});

export const PollOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1).max(280),
  votes: z.number().int().nonnegative().optional(),
});

export const PollSchema = z.object({
  options: z.array(PollOptionSchema).min(2).max(10),
  anonymousVotes: z.boolean().optional().default(true),
});

export const rawWhisperPostSchema = z.object({
  visibility: PostVisibility.default(postVisibilities[0]),
  category: PostCategory.default(postCategories[0]),
  content: z.string().min(2,{
    message: "Post must be at least 2 characters long",
  }).max(5000,{
    message: "Post cannot exceed 5000 characters",
  }),
  pseudo: PseudoIdentitySchema.optional(), // no null, just undefined if missing
  poll: PollSchema.optional(),
})

export const WhisperPostSchema = z.object({
  _id: z.string().optional(),
  authorId: z.string(), // Postgres user id
  ...rawWhisperPostSchema.shape,
  reactions: z.array(ReactionSchema).optional().default([]),
  reports: z.array(ReportSchema).optional().default([]),
  moderationStatus: ModerationStatus.default(moderationStatuses[0]),
  score: z.number().int().default(0),
  pinned: z.boolean().default(false),
  pinnedUntil: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type WhisperPostT = z.infer<typeof WhisperPostSchema>;

export type ReactionT = z.infer<typeof ReactionSchema>;
export type ReportT = z.infer<typeof ReportSchema>;
export type PseudoIdentityT = z.infer<typeof PseudoIdentitySchema>;
export type PollT = z.infer<typeof PollSchema>;



