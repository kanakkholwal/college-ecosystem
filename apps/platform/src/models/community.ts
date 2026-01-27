import mongoose, { Document, Schema, Types } from "mongoose";
import * as z from "zod";
import {
  CATEGORY_TYPES,
  SUB_CATEGORY_TYPES,
  RawCommunityPostType
} from "~/constants/common.community";



export type CommunityPostTypeWithId = RawCommunityPostType & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
  };
  views: number;
  likes: string[];
  savedBy: string[];
};

export interface ICommunityPost extends Document {
  title: string;
  content: string;
  category: (typeof CATEGORY_TYPES)[number];
  subCategory?: (typeof SUB_CATEGORY_TYPES)[number];
  content_json: RawCommunityPostType["content_json"];
  author: {
    id: string;
    name: string;
    username: string;
  };
  views: number;
  likes: string[]; // Updated type from string[] to string[]
  savedBy: string[]; // Updated type from string[] to string[]
  updatedAt: Date;
  createdAt: Date;
}

const communityPostSchema = new Schema<ICommunityPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: CATEGORY_TYPES, required: true },
    views: { type: Number, required: true },
    content_json: { type: Object },
    likes: [String],
    savedBy: [String],
    author: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      username: { type: String, required: true },
    },
    subCategory: { type: String, enum: SUB_CATEGORY_TYPES, default: null },
  },
  {
    timestamps: true,
  }
);
export const rawCommunityCommentSchema = z.object({
  content: z.string().min(10, "Content must be atleast 10 characters long."), // markdown
  postId: z.string(),
  parent: z.string().nullable(),
  replies: z.array(z.string()),
  author: z.string(),
});
interface ICommunityComment extends Document {
  content: string;
  postId: Types.ObjectId;
  parentComment: Types.ObjectId | null;
  replies: Types.ObjectId[];
  author: {
    id: string;
    name: string;
    username: string;
  };
}

const communityCommentSchema = new Schema<ICommunityComment>(
  {
    content: { type: String, required: true },
    author: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      username: { type: String, required: true },
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityPost",
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityComment",
      default: null,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommunityComment",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const CommunityComment =
  mongoose.models?.CommunityComment ||
  mongoose.model<ICommunityComment>("CommunityComment", communityCommentSchema);

export default mongoose.models?.CommunityPost ||
  mongoose.model<ICommunityPost>("CommunityPost", communityPostSchema);
