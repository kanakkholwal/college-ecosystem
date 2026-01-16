import mongoose, { type Document, Schema } from "mongoose";

export interface Course {
  name: string;
  code: string;
  cgpi: number;
  // additional fields
  grade: string;
  credits: number;
  sub_points: number;
}
export interface Rank {
  college: number;
  batch: number;
  branch: number;
  class: number;
}

export interface Semester {
  sgpi: number;
  cgpi: number;
  courses: Course[];
  semester: string;
  sgpi_total: number;
  cgpi_total: number;
}
export interface ResultTypeWithId {
  _id: string;
  name: string;
  rollNo: string;
  branch: string;
  batch: number;
  programme: string;
  semesters: Semester[];
  rank: Rank;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IResultType extends Document {
  name: string;
  rollNo: string;
  branch: string;
  batch: number;
  programme: string;
  semesters: Semester[];
  rank: Rank;
  createdAt?: Date;
  updatedAt?: Date;
  gender?: "male" | "female" | "not_specified";
  latestCgpi?: number;
}

const CourseSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  cgpi: { type: Number, required: true },
  // additional fields
  grade: { type: String, trim: true },
  credits: { type: Number, min: 0 },
  sub_points: { type: Number, min: 0 },
});

const SemesterSchema: Schema = new Schema({
  sgpi: { type: Number, required: true },
  cgpi: { type: Number, required: true },
  courses: { type: [CourseSchema], required: true },
  semester: { type: String, required: true },
  sgpi_total: { type: Number, required: true },
  cgpi_total: { type: Number, required: true },
  
});

const ResultSchema = new Schema<IResultType>(
  {
    name: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true },
    branch: { type: String, required: true },
    batch: { type: Number, required: true },
    programme: { type: String, required: true },
    semesters: { type: [SemesterSchema], required: true },
    latestCgpi: { type: Number, default: 0 }, // Add this field
    gender: {
      type: String,
      enum: ["male", "female", "not_specified"],
      default: "not_specified",
    },
    rank: {
      college: { type: Number, default: 0 },
      batch: { type: Number, default: 0 },
      branch: { type: Number, default: 0 },
      class: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
// ResultSchema.index({ latestCgpi: -1 }); // Critical for sorting
// ResultSchema.index({ batch: 1, latestCgpi: -1 });
// ResultSchema.index({ batch: 1, branch: 1, latestCgpi: -1 });

// Pre-save hook to update latestCgpi
ResultSchema.pre('save', function(next) {
  if (this.semesters && this.semesters?.length > 0) {
    this.latestCgpi = this.semesters[this.semesters.length - 1].cgpi || 0;
  }
  next();
});
const ResultModel =
  mongoose.models?.Result || mongoose.model<IResultType>("Result", ResultSchema);

export default ResultModel;
