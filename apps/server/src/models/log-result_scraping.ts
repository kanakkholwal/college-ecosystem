import mongoose, { type Document, Schema } from "mongoose";
import { listType, TASK_STATUS } from "../constants/result_scraping";


export type taskDataType = {
  processable: number;
  processed: number;
  failed: number;
  success: number;
  data: {
    roll_no: string;
    reason: string;
  }[];
  startTime: Date;
  endTime: Date | null;
  status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
  successfulRollNos: string[];
  failedRollNos: string[];
  queue: string[];
  list_type: listType;
  taskId: string;
  _id: string;
};
export interface IResultScrapingLog extends Document,Omit<taskDataType, "_id"> {
}

const ResultScrapingLogSchema = new Schema<IResultScrapingLog>({
  processable: { type: Number, required: true, default: 0 },
  processed: { type: Number, required: true, default: 0 },
  failed: { type: Number, required: true, default: 0 },
  success: { type: Number, required: true, default: 0 },
  data: {
    type: [{
      roll_no: { type: String, required: true },
      reason: { type: String, required: true },
    }], default: []
  },
  status: { type: String, required: true },
  successfulRollNos: { type: [String], required: true, default: [] },
  failedRollNos: { type: [String], required: true, default: [] },
  queue: { type: [String], required: true, default: [] },
  list_type: { type: String, required: true },
  taskId: { type: String, required: true, unique: true },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date, default: null },
});

export const ResultScrapingLog =
  mongoose.models.ResultScrapingLog ||
  mongoose.model<IResultScrapingLog>(
    "ResultScrapingLog",
    ResultScrapingLogSchema
  );
