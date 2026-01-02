import type { Request, Response } from "express";
import { z } from "zod";
import { getDepartmentCoursePrefix, isValidRollNumber } from "../constants/departments";
import { pipelines } from "../constants/pipelines";
import { scrapeAndSaveResult } from "../lib/result_utils";
import { getInfoFromRollNo, scrapeResult } from "../lib/scrape";
import { ResultScrapingLog } from "../models/log-result_scraping";
import ResultModel from "../models/result";
import { rawResultSchema } from "../types/result";
import dbConnect from "../utils/dbConnect";

// Helper: safe error body
const safeErrorBody = (msg = "Internal Server Error", err?: unknown) => ({
  message: msg,
  error: true,
  data: typeof err === "string" ? err : undefined,
});

// Endpoint to get result by rollNo scraped from the website
export const getResultByRollNoFromSite = async (req: Request, res: Response) => {
  const rollNo = req.params.rollNo;
  if (!isValidRollNumber(rollNo)) {
    return res.status(400).json({ message: "Invalid roll number", error: true, data: null });
  }
  try {
    const data = await scrapeResult(rollNo);
    return res.status(200).json(data);
  } catch (err) {
    console.error("getResultByRollNoFromSite error:", err);
    return res.status(500).json(safeErrorBody("Failed to fetch result", (err as Error)?.message));
  }
};

export const getResult = async (req: Request, res: Response) => {
  const rollNo = req.params.rollNo;
  if (!isValidRollNumber(rollNo)) {
    return res.status(400).json({ message: "Invalid roll number", error: true, data: null });
  }
  try {
    await dbConnect();
    const resultData = await ResultModel.findOne({ rollNo });
    if (!resultData) {
      return res.status(404).json({ message: "Result not found", error: true, data: null });
    }
    return res.status(200).json({ data: resultData, message: "Result found", error: false });
  } catch (err) {
    console.error("getResult error:", err);
    return res.status(500).json(safeErrorBody("An error occurred", (err as Error)?.message));
  }
};

// Endpoint to add result by rollNo from the site to DB
export const addResult = async (req: Request, res: Response) => {
  const rollNo = req.params.rollNo;
  if (!isValidRollNumber(rollNo)) {
    return res.status(400).json({ message: "Invalid roll number", error: true, data: null });
  }

  try {
    await dbConnect();
    const resultData = await ResultModel.findOne({ rollNo });
    if (resultData) {
      return res.status(200).json({ data: resultData, message: "Result already exists", error: false });
    }

    const data = await scrapeResult(rollNo);
    if (data?.error || !data?.data) {
      return res.status(500).json(data);
    }

    const result = data.data;
    const newResult = new ResultModel({
      rollNo,
      name: result.name,
      branch: result.branch,
      batch: result.batch,
      programme: result.programme,
      semesters: result.semesters,
    });
    await newResult.save();
    console.log("Created ", rollNo);
    return res.status(201).json({ data: newResult, message: "Result added successfully", error: false });
  } catch (err) {
    console.error("addResult error:", err);
    return res.status(500).json(safeErrorBody("An error occurred while adding result", (err as Error)?.message));
  }
};

export const updateResult = async (req: Request, res: Response) => {
  const rollNo = req.params.rollNo;
  if (!isValidRollNumber(rollNo)) {
    return res.status(400).json({ message: "Invalid roll number", error: true, data: null });
  }

  const custom_attributes = rawResultSchema.partial().safeParse(req.body);
  if (!custom_attributes.success) {
    return res.status(400).json({ message: "Invalid custom attributes", error: true, data: custom_attributes.error.issues });
  }
  const valid_custom_attributes = custom_attributes.data;

  try {
    await dbConnect();
    const resultData = await ResultModel.findOne({ rollNo });
    if (!resultData) {
      return res.status(404).json({ message: "Result not found", error: true, data: null });
    }

    const data = await scrapeResult(rollNo);
    if (data?.error || !data?.data) {
      return res.status(500).json(data);
    }
    const result = data.data;

    // Return the updated document
    const updated = await ResultModel.findByIdAndUpdate(
      resultData._id,
      {
        $set: {
          ...(valid_custom_attributes ? { ...valid_custom_attributes } : {}),
          name: result.name,
          branch: result.branch,
          batch: result.batch,
          programme: result.programme,
          semesters: result.semesters,
        },
      },
      { new: true, runValidators: true }
    );

    console.log("Updated ", rollNo);
    return res.status(200).json({ data: updated, message: "Result updated successfully", error: false });
  } catch (error) {
    console.error("updateResult error:", error);
    return res.status(500).json(safeErrorBody("An error occurred", (error as Error)?.message));
  }
};

export const deleteResult = async (req: Request, res: Response) => {
  const rollNo = req.params.rollNo;
  if (!isValidRollNumber(rollNo)) {
    return res.status(400).json({ message: "Invalid roll number", error: true, data: null });
  }
  try {
    await dbConnect();
    const resultData = await ResultModel.deleteOne({ rollNo });
    if (resultData.deletedCount === 0) {
      return res.status(404).json({ message: "Result not found", error: true, data: null });
    }
    return res.status(200).json({ data: resultData, message: "Result deleted successfully", error: false });
  } catch (error) {
    console.error("deleteResult error:", error);
    return res.status(500).json(safeErrorBody("An error occurred", (error as Error)?.message));
  }
};

export const getAbnormalResults = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const results = await ResultModel.aggregate(pipelines["abnormal-results"]);
    return res.status(200).json({ error: false, message: "Abnormal results fetched successfully", data: results });
  } catch (error) {
    console.error("getAbnormalResults error:", error);
    return res.status(500).json(safeErrorBody("An error occurred", (error as Error)?.message));
  }
};

export const deleteAbNormalResults = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const results = await ResultModel.aggregate(pipelines["abnormal-results"]);
    if (!results || results.length === 0) {
      return res.status(404).json({ error: true, message: "No abnormal results found", data: null });
    }
    const abnormalIds = results.map((r) => r._id);
    const deleteResult = await ResultModel.deleteMany({ _id: { $in: abnormalIds } });

    console.log(`Deleted ${deleteResult.deletedCount} abnormal results`);
    return res.status(200).json({
      error: false,
      message: `Deleted ${deleteResult.deletedCount} abnormal results`,
      data: {
        deletedCount: deleteResult.deletedCount,
        acknowledged: deleteResult.acknowledged,
        abnormalIds,
      },
    });
  } catch (error) {
    console.error("deleteAbNormalResults error:", error);
    return res.status(500).json(safeErrorBody("An error occurred", (error as Error)?.message));
  }
};

export const bulkUpdateResults = async (req: Request, res: Response) => {
  try {
    const rollNos = (req.body.rollNos || []) as string[];
    const validatedRollNos = rollNos.filter(isValidRollNumber);
    if (validatedRollNos.length === 0) {
      return res.status(400).json({ error: true, message: "No valid roll numbers provided", data: null });
    }
    const BATCH_SIZE = 8;
    const result = { total: validatedRollNos.length, updated: 0, errors: [] as { rollNo: string; error: string }[] };

    for (let i = 0; i < validatedRollNos.length; i += BATCH_SIZE) {
      const batch = validatedRollNos.slice(i, i + BATCH_SIZE);

      // run batch concurrently but collect results with index
      const outcomes = await Promise.allSettled(batch.map((rn) => scrapeAndSaveResult(rn)));

      outcomes.forEach((outcome, idx) => {
        const rn = batch[idx];
        if (outcome.status === "fulfilled") {
          result.updated += 1;
        } else {
          result.errors.push({ rollNo: rn, error: (outcome as PromiseRejectedResult).reason ? String((outcome as PromiseRejectedResult).reason) : "Unknown error" });
        }
      });
    }

    return res.status(200).json({ error: false, message: "Bulk update successful", data: result });
  } catch (error) {
    console.error("bulkUpdateResults error:", error);
    return res.status(500).json(safeErrorBody("An error occurred", (error as Error)?.message));
  }
};

export const bulkDeleteResults = async (req: Request, res: Response) => {
  try {
    const rollNos = (req.body.rollNos || []) as string[];
    const validatedRollNos = rollNos.filter(isValidRollNumber);
    if (validatedRollNos.length === 0) {
      return res.status(400).json({ error: true, message: "No valid roll numbers provided", data: null });
    }
    await dbConnect();
    const result = await ResultModel.deleteMany({ rollNo: { $in: validatedRollNos } });

    return res.status(200).json({
      error: false,
      message: "Bulk delete successful",
      data: { deletedCount: result.deletedCount, acknowledged: result.acknowledged, identifiers: validatedRollNos },
    });
  } catch (error) {
    console.error("bulkDeleteResults error:", error);
    return res.status(500).json(safeErrorBody("An error occurred", (error as Error)?.message));
  }
};

export const assignRankToResults = async (req: Request, res: Response) => {
  try {
    const start = Date.now();
    await dbConnect();

    try{const resultsWithRanks = await ResultModel.aggregate(pipelines["assign-rank"]).allowDiskUse(true);

    const bulkUpdates = resultsWithRanks.map((r) => ({ updateOne: { filter: { _id: r._id }, update: { rank: r.rank } } }));
    if (bulkUpdates.length > 0) {
      const bulkWriteResult = await ResultModel.bulkWrite(bulkUpdates);
      const writeErrors = (bulkWriteResult as any)?.writeErrors ?? [];
      return res.status(200).json({
        error: false,
        message: "Ranks assigned successfully.",
        data: {
          timeTaken: `${(Date.now() - start) / 1000}s`,
          lastUpdated: new Date().toISOString(),
          success: !!(bulkWriteResult as any).ok,
          modifiedCount: (bulkWriteResult as any).modifiedCount ?? 0,
          matchedCount: (bulkWriteResult as any).matchedCount ?? 0,
          failed: writeErrors,
        },
      });
    }

    return res.status(200).json({ error: false, message: "No ranks to assign", data: { timeTaken: `${(Date.now() - start) / 1000}s` } });}
    catch (error) {
      console.log("[assignRankToResults] inner error for aggregations:", error);
          // Fetch all results with only necessary fields
    const results = await ResultModel.find(
      { 
        semesters: { $exists: true, $ne: [], $type: "array" } 
      },
      {
        _id: 1,
        batch: 1,
        branch: 1,
        semesters: { $slice: -1 } // Only get the last semester
      }
    ).lean();

    console.log(`Fetched ${results.length} documents`);

    if (results.length === 0) {
      return res.status(200).json({
        error: false,
        message: "No results to rank",
        data: { timeTaken: `${(Date.now() - start) / 1000}s` }
      });
    }

    // Extract CGPI and prepare data
    const resultsWithCgpi = results
      .map(r => ({
        _id: r._id,
        batch: r.batch,
        branch: r.branch,
        cgpi: r.semesters?.[0]?.cgpi ?? 0
      }))
      .filter(r => r.cgpi >= 0);

    // Sort by CGPI (descending)
    resultsWithCgpi.sort((a:any, b:any) => {
      if (b.cgpi !== a.cgpi) return b.cgpi - a.cgpi;
      return a._id!.toString().localeCompare(b._id!.toString());
    });

    // Assign college ranks
    const rankMap = new Map<string, any>();
    resultsWithCgpi.forEach((result, index) => {
      rankMap.set(result._id!.toString(), {
        college: index + 1,
        batch: 0,
        branch: 0,
        class: 0
      });
    });

    // Assign batch ranks
    const byBatch = new Map<number, typeof resultsWithCgpi>();
    resultsWithCgpi.forEach(r => {
      if (!byBatch.has(r.batch)) {
        byBatch.set(r.batch, []);
      }
      byBatch.get(r.batch)!.push(r);
    });

    byBatch.forEach((batchResults, batch) => {
      batchResults.sort((a:any, b:any) => {
        if (b.cgpi !== a.cgpi) return b.cgpi - a.cgpi;
        return a._id?.toString().localeCompare(b._id.toString());
      });
      
      batchResults.forEach((result, index) => {
        const rank = rankMap.get(result._id!.toString());
        if (rank) rank.batch = index + 1;
      });
    });

    // Assign branch and class ranks
    const byBranchBatch = new Map<string, typeof resultsWithCgpi>();
    resultsWithCgpi.forEach(r => {
      const key = `${r.batch}-${r.branch}`;
      if (!byBranchBatch.has(key)) {
        byBranchBatch.set(key, []);
      }
      byBranchBatch.get(key)!.push(r);
    });

    byBranchBatch.forEach((branchResults, key) => {
      branchResults.sort((a:any, b:any) => {
        if (b.cgpi !== a.cgpi) return b.cgpi - a.cgpi;
        return a._id!.toString().localeCompare(b._id!.toString());
      });
      
      branchResults.forEach((result, index) => {
        const rank = rankMap.get(result._id!.toString());
        if (rank) {
          rank.branch = index + 1;
          rank.class = index + 1;
        }
      });
    });

    // Prepare bulk updates
    const bulkUpdates = Array.from(rankMap.entries()).map(([id, rank]) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { rank } }
      }
    }));

    console.log(`Prepared ${bulkUpdates.length} updates`);

    // Execute bulk write in chunks to avoid memory issues
    const CHUNK_SIZE = 1000;
    let totalModified = 0;
    let totalMatched = 0;

    for (let i = 0; i < bulkUpdates.length; i += CHUNK_SIZE) {
      const chunk = bulkUpdates.slice(i, i + CHUNK_SIZE);
      const bulkWriteResult = await ResultModel.bulkWrite(chunk, {
        ordered: false
      });
      
      totalModified += bulkWriteResult.modifiedCount ?? 0;
      totalMatched += bulkWriteResult.matchedCount ?? 0;
      
      console.log(`Processed chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(bulkUpdates.length / CHUNK_SIZE)}`);
    }

    return res.status(200).json({
      error: false,
      message: "Ranks assigned successfully.",
      data: {
        timeTaken: `${(Date.now() - start) / 1000}s`,
        lastUpdated: new Date().toISOString(),
        modifiedCount: totalModified,
        matchedCount: totalMatched,
        totalDocuments: results.length
      },
    });
    }

  } catch (error) {
    console.error("assignRankToResults error:", error);
    return res.status(500).json(safeErrorBody("An error occurred", (error as Error)?.message));
  }
};

export const assignBranchChangeToResults = async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    await dbConnect();

    const results = await ResultModel.aggregate(pipelines["assign-branch-change"]).allowDiskUse(true);

    const bulkOperations = results.map((result) => {
      // Efficient frequency count
      const courseCount = (result.uniquePrefixes || []).reduce((acc: Record<string, number>, prefix: string) => {
        acc[prefix] = (acc[prefix] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const counts = Object.values(courseCount) as number[];
      const maxCourses = counts.length > 0 ? Math.max(...counts) : 0;
      const maxPrefix = Object.keys(courseCount).find((prefix) => courseCount[prefix] === maxCourses) || null;
      const department = getDepartmentCoursePrefix(maxPrefix || "");

      const updates: any = {
        gender: result.gender !== "not_specified" ? result.gender : "not_specified",
        branch: result.branch,
      };

      if (department && department !== "other" && department !== result.branch) {
        updates.branch = department;
        console.log(`Branch change detected for ${result.rollNo}`);
      }

      return { updateOne: { filter: { _id: result._id }, update: updates } };
    });

    if (bulkOperations.length > 0) {
      await ResultModel.bulkWrite(bulkOperations);
    }

    // cleanup: unset latestSemester field if present
    await ResultModel.updateMany({}, { $unset: { latestSemester: "" } });

    return res.status(200).json({
      error: false,
      message: "Branch change script executed successfully",
      data: { timeTaken: `${(Date.now() - startTime) / 1000}s`, lastUpdated: new Date().toISOString() },
    });
  } catch (error) {
    console.error("assignBranchChangeToResults error:", error);
    return res.status(500).json(safeErrorBody("An error occurred", (error as Error)?.message));
  }
};

const freshersDataSchema = z.array(
  z.object({
    name: z.string(),
    rollNo: z.string(),
    gender: z.enum(["male", "female", "not_specified"]),
  })
);

export const importFreshers = async (req: Request, res: Response) => {
  try {
    const time = Date.now();
    await dbConnect();

    const data = req.body;
    const parsedData = freshersDataSchema.safeParse(data);
    if (!parsedData.success) {
      return res.status(400).json({ error: true, message: "Invalid data", data: parsedData.error.issues });
    }

    // build freshers list defensively
    const results = await Promise.all(
      parsedData.data.map(async (student) => {
        try {
          const info = await getInfoFromRollNo(student.rollNo);
          return { name: student.name, rollNo: student.rollNo, branch: info.branch, batch: info.batch, programme: info.programme, gender: student.gender, semesters: [] };
        } catch (err) {
          console.error(`getInfoFromRollNo failed for ${student.rollNo}:`, err);
          // fallback but keep rollNo so caller can see problem
          return { name: student.name, rollNo: student.rollNo, branch: "unknown", batch: 0, programme: "unknown", gender: student.gender, semesters: [] };
        }
      })
    );

    // insertMany with ordered:false to continue on duplicates
    const inserted = await ResultModel.insertMany(results, { ordered: false }).catch((e) => {
      // if duplicates occur, Mongoose throws; capture inserted docs if available
      console.warn("insertMany partial failure", (e as any)?.message);
      // rethrow so outer catch can handle, or return what we can; to keep minimal changes, rethrow
      throw e;
    });

    return res.status(200).json({
      error: false,
      message: "Freshers imported successfully.",
      data: { timeTaken: `${(Date.now() - time) / 1000}s`, lastUpdated: new Date().toISOString(), results: `${inserted.length} freshers imported` },
    });
  } catch (error) {
    console.error("importFreshers error:", error);
    return res.status(500).json(safeErrorBody("An error occurred", (error as Error)?.message));
  }
};

export const createBatchUsingPrevious = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const allBatches = (await ResultModel.distinct("batch")) as number[];
    const latestBatch = allBatches && allBatches.length ? allBatches.sort((a, b) => b - a)[0] : 0;
    const newBatch = latestBatch + 1;
    const previousBatchResults = latestBatch > 0 ? await ResultModel.find({ batch: latestBatch }) : [];

    await ResultScrapingLog.create({
      processable: previousBatchResults.length,
      processed: 0,
      failed: 0,
      success: 0,
      data: [],
      status: "in_progress",
      successfulRollNos: [],
      failedRollNos: [],
      queue: [],
      list_type: "previous_batch",
      taskId: `create-batch-${newBatch}`,
      startTime: new Date(),
      endTime: null,
    });

    return res.status(200).json({ error: false, message: "Batch created successfully", data: { previousBatchResults, newBatch } });
  } catch (error) {
    console.error("createBatchUsingPrevious error:", error);
    return res.status(500).json(safeErrorBody("An error occurred", (error as Error)?.message));
  }
};
