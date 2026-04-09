import mongoose, { Document, Schema } from "mongoose";
export interface ChapterType {
  title: string;
  topics: string[];
  lectures: number;
}
export type booksAndRefType = {
  name: string;
  link: string;
  type: "book" | "reference" | "drive" | "youtube" | "others";
};
export type prevPaperType = {
  year: number;
  exam: "midsem" | "endsem" | "others";
  link: string;
};

const chapterSchema = new Schema<ChapterType>({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  topics: {
    type: [String],
    trim: true,
  },
  lectures: Number,
});
export interface CourseType {
  name: string;
  code: string;
  type: string;
  credits: number;
  department: string;
  chapters: ChapterType[];
  outcomes?: string[];
  books_and_references: booksAndRefType[];
  prev_papers: prevPaperType[];
  createdAt?: Date;
  updatedAt?: Date;
}
export interface CourseTypeWithId extends CourseType {
  _id: string;
}
export interface CourseDocument extends CourseType, Document {}

const courseSchema = new Schema<CourseDocument>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    code: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    type: {
      type: String,
      trim: true,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    chapters: { type: [chapterSchema], required: true },
    department: { type: String, required: true },
    prev_papers: {
      type: [
        {
          exam: {
            type: String,
            enums: ["mid", "end", "others"],
            required: true,
          },
          link: {
            type: String,
            required: true,
            trim: true,
          },
          year: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
    outcomes: {
      type: [String],
      trim: true,
    },
    books_and_references: {
      type: [
        {
          name: String,
          link: String,
          type: {
            type: String,
            enums: ["book", "reference", "drive", "youtube", "others"],
          },
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Course =
  mongoose.models.Course ||
  mongoose.model<CourseDocument>("Course", courseSchema);

export default Course;
