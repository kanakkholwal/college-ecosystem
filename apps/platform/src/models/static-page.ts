import mongoose, { Schema, Types } from "mongoose";
import * as z from "zod";

export const rawStaticPageSchema = z.object({
  title: z.string().min(5),
  slug: z.string(),
  content: z.string().min(100),
});

export type RawStaticPage = z.infer<typeof rawStaticPageSchema>;

export interface IStaticPage extends RawStaticPage {
  author: Types.ObjectId;
}

export interface StaticPageWithId extends RawStaticPage {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  // author:string;
}

const staticPageSchema = new Schema<IStaticPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models?.StaticPage ||
  mongoose.model<IStaticPage>("StaticPage", staticPageSchema);
