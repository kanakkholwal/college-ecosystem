// zod-schemas.ts
import { Drama, HatGlasses, Heart, Plus, ShowerHead, VenetianMask } from "lucide-react";
import { FaEarListen, FaRegFaceLaughSquint, FaRegFlag, FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa6";
import { z } from "zod";

export const PostVisibility = z.enum(["ANONYMOUS", "PSEUDO", "IDENTIFIED"]);
export const PostCategory = z.enum(["CONFESSION", "CRITICISM", "PRAISE", "SHOWER_THOUGHT", "OTHER"]);
export const ModerationStatus = z.enum(["PENDING", "APPROVED", "REMOVED", "FLAGGED", "REVIEWED"]);
export const ReactionType = z.enum(["LIKE", "LAUGH", "RELATE", "AGREE", "DISAGREE", "REPORT"]);

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
  question: z.string().min(1).max(280),
  options: z.array(PollOptionSchema).min(2).max(10),
  expiresAt: z.date().optional(),
  anonymousVotes: z.boolean().optional().default(true),
});

export const WhisperPostSchema = z.object({
  _id: z.string().optional(),
  authorId: z.string(), // Postgres user id
  visibility: PostVisibility.default("ANONYMOUS"),
  category: PostCategory.default("OTHER"),
  content: z.string().min(1).max(5000),
  attachments: z.array(z.string().url()).optional().default([]),
  pseudo: PseudoIdentitySchema.optional(), // no null, just undefined if missing
  reactions: z.array(ReactionSchema).optional().default([]),
  reports: z.array(ReportSchema).optional().default([]),
  moderationStatus: ModerationStatus.default("PENDING"),
  score: z.number().int().default(0),
  pinned: z.boolean().default(false),
  pinnedUntil: z.date().optional(),
  poll: PollSchema.optional(),
  meta: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type WhisperPostT = z.infer<typeof WhisperPostSchema>;

export type ReactionT = z.infer<typeof ReactionSchema>;
export type ReportT = z.infer<typeof ReportSchema>;
export type PseudoIdentityT = z.infer<typeof PseudoIdentitySchema>;
export type PollT = z.infer<typeof PollSchema>;



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
    value: "CONFESSION",
    label: "Confession",
    Icon: Drama,
    description: "Get it off your chest — no judgment here.",
  },
  {
    value: "CRITICISM",
    label: "Criticism",
    Icon: VenetianMask,
    description: "Point out issues, share constructive feedback.",
  },
  {
    value: "PRAISE",
    label: "Praise",
    Icon: FaEarListen,
    description: "Celebrate people, events, or anything wholesome.",
  },
  {
    value: "SHOWER_THOUGHT",
    label: "Shower Thought",
    Icon: ShowerHead,
    description: "Random brain dump moments.",
  },
  {
    value: "OTHER",
    label: "Other",
    Icon: HatGlasses,
    description: "Doesn’t fit in a box? Put it here.",
  },
] as const;


export const REACTION_OPTIONS = [
  { value: "LIKE", label: "👍 Like",Icon:Heart },
  { value: "LAUGH", label: "😂 Laugh",Icon:FaRegFaceLaughSquint  },
  { value: "RELATE", label: "😌 Relatable" ,Icon:Plus  },
  { value: "AGREE", label: "👌 Agree",Icon:FaRegThumbsUp },
  { value: "DISAGREE", label: "🙅 Disagree",Icon:FaRegThumbsDown },
  { value: "REPORT", label: "🚩 Report",Icon:FaRegFlag },
] as const;

export type ReactionType = (typeof REACTION_OPTIONS)[number]["value"];
