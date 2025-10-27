import mongoose, { type Document, Schema } from "mongoose";

export interface Course {
  name: string;
  code: string;
  cgpi: number;
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
  semester: number | string;
  sgpi_total: number;
  cgpi_total: number;
}

export type rawResultType = {
  name: string;
  rollNo: string;
  branch: string;
  batch: number;
  programme: string;
  semesters: Semester[];
  rank: Rank;
  createdAt?: Date;
  updatedAt?: Date;
  gender: "male" | "female" | "not_specified";
};

export interface ResultTypeWithId extends rawResultType {
  _id: string;
}

export interface IResultType extends Document, rawResultType {}

const CourseSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  cgpi: { type: Number, required: true },
},{ _id: false });

const SemesterSchema: Schema = new Schema({
  sgpi: { type: Number, required: true },
  cgpi: { type: Number, required: true },
  courses: { type: [CourseSchema], required: true },
  semester: { type: Schema.Types.Mixed, required: true },
  sgpi_total: { type: Number, required: true },
  cgpi_total: { type: Number, required: true },
}, { _id: false });

const ResultSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true },
    branch: { type: String, required: true },
    batch: { type: Number, required: true },
    programme: { type: String, required: true },
    semesters: { type: [SemesterSchema], required: true },
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

// compound / text indexes
ResultSchema.index({ "rank.college": 1, _id: -1 });
ResultSchema.index({ branch: 1, batch: 1 });
ResultSchema.index({ name: "text" }); // if using text search on name

const ResultModel =
  mongoose.models.Result || mongoose.model<IResultType>("Result", ResultSchema);

export default ResultModel;
