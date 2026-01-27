import mongoose from "mongoose";
import * as z from "zod";

export const rawPollSchema = z.object({
  question: z.string(),
  description: z.string().optional(),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least two options are required"),
  multipleChoice: z.boolean().default(false),
  votes: z.array(z.string()).default([]),
  closesAt: z.date().default(() => new Date(Date.now() + 6 * 60 * 60 * 1000)), // Default to 6 hours from now
});

export type RawPollType = z.infer<typeof rawPollSchema>;

export type PollType = Omit<RawPollType, "votes"> & {
  votes: { option: string; userId: string, createdAt: Date }[];
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};

// auto delete ttl after 1 week of closing

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    description: { type: String },
    options: [{ type: String, required: true }],
    multipleChoice: { type: Boolean, default: false },
    votes: [
      {
        option: { type: String, required: true },
        userId: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    closesAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 6 * 60 * 60 * 1000),
      index: { expires: "1w" },
    }, // Default to 6 hours from now
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Poll || mongoose.model("Poll", pollSchema);
