// models/whisper.model.ts
import mongoose, { Document, Model, Schema } from "mongoose";
import { moderationStatuses, postCategories, postReactions, postVisibilities, WhisperPostT } from "~/constants/community.whispers";

export interface IReaction {
    userId?: string; // Postgres user id
    type: typeof postReactions[number];
    createdAt?: Date;
}

export interface IReport {
    reporterId?: string; // Postgres user id
    reason: string;
    createdAt?: Date;
}

export interface IPseudoIdentity {
    handle: string;
    avatar?: string;
    color?: string;
}

export interface IPollOption {
    id: string;
    text: string;
    votes: number;
}

export interface IPoll {
    question: string;
    options: IPollOption[];
    expiresAt?: Date;
    anonymousVotes: boolean; // Ensure this is always a boolean
}

export interface IWhisperPost extends Document, Omit<WhisperPostT, "_id" | "createdAt" | "updatedAt"> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    pseudo?: IPseudoIdentity; // no null
    reactions: IReaction[];
    reports: IReport[];
    poll?: IPoll;
}

/* Sub-schemas */
const ReactionSubSchema = new Schema<IReaction>(
    {
        userId: { type: String, required: false },
        type: { type: String, enum: postReactions, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const ReportSubSchema = new Schema<IReport>(
    {
        reporterId: { type: String, required: false },
        reason: { type: String, required: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const PseudoIdentitySubSchema = new Schema<IPseudoIdentity>(
    {
        handle: { type: String, required: true, minlength: 2, maxlength: 32 },
        avatar: { type: String },
        color: { type: String },
    },
    { _id: false }
);

const PollOptionSchema = new Schema<IPollOption>(
    {
        id: { type: String, required: true },
        text: { type: String, required: true, maxlength: 280 },
        votes: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const PollSubSchema = new Schema<IPoll>(
    {
        question: { type: String, required: true, maxlength: 280 },
        options: { type: [PollOptionSchema], required: true },
        expiresAt: { type: Date },
        anonymousVotes: { type: Boolean, default: true, required: true },
    },
    { _id: false }
);

/* Main schema */
const WhisperPostSchema = new Schema<IWhisperPost>(
    {
        authorId: { type: String, required: false, select: false }, // from Session["user"].id
        visibility: { type: String, enum: postVisibilities, default: postVisibilities[0] },
        category: { type: String, enum: postCategories, required: true, },
        content: { type: String, required: true, minlength: 2, maxlength: 5000 },
        pseudo: { type: PseudoIdentitySubSchema, required: false },
        reactions: { type: [ReactionSubSchema], default: [] },
        reports: { type: [ReportSubSchema], default: [] },
        moderationStatus: { type: String, enum: moderationStatuses, default: moderationStatuses[0], index: true },
        score: { type: Number, default: 0, index: true },
        pinned: { type: Boolean, default: false },
        pinnedUntil: { type: Date },
        poll: { type: PollSubSchema, required: false },
    },
    { timestamps: true, versionKey: false }
);

WhisperPostSchema.index({ score: -1, createdAt: -1 });
WhisperPostSchema.index({ moderationStatus: 1, createdAt: -1 });

export const WhisperPostModel: Model<IWhisperPost> =
    mongoose.models.WhisperPost || mongoose.model<IWhisperPost>("WhisperPost", WhisperPostSchema);
