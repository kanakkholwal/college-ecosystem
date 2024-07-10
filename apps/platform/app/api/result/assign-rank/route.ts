import type { PipelineStage } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "src/lib/dbConnect";
import ResultModel from "src/models/result";

export async function POST(request: NextRequest) {
  try {
    const time = new Date();
    await dbConnect();

    const aggregationPipeline = [
      {
        $set: {
          latestSemester: { $arrayElemAt: ["$semesters", -1] },
        },
      },
      {
        $sort: { "latestSemester.cgpi": -1 },
      },
      {
        $group: {
          _id: null,
          results: { $push: "$$ROOT" },
        },
      },
      {
        $unwind: { path: "$results", includeArrayIndex: "collegeRank" },
      },
      {
        $set: {
          "results.rank.college": { $add: ["$collegeRank", 1] },
        },
      },
      {
        $group: {
          _id: "$results.batch",
          results: { $push: "$results" },
        },
      },
      {
        $unwind: { path: "$results", includeArrayIndex: "batchRank" },
      },
      {
        $set: {
          "results.rank.batch": { $add: ["$batchRank", 1] },
        },
      },
      {
        $group: {
          _id: { batch: "$results.batch", branch: "$results.branch" },
          results: { $push: "$results" },
        },
      },
      {
        $unwind: { path: "$results", includeArrayIndex: "branchRank" },
      },
      {
        $set: {
          "results.rank.branch": { $add: ["$branchRank", 1] },
        },
      },
      {
        $group: {
          _id: { batch: "$results.batch", branch: "$results.branch" },
          results: { $push: "$results" },
        },
      },
      {
        $unwind: { path: "$results", includeArrayIndex: "classRank" },
      },
      {
        $set: {
          "results.rank.class": { $add: ["$classRank", 1] },
        },
      },
      {
        $replaceRoot: { newRoot: "$results" },
      },
      {
        $merge: {
          into: "results",
          whenMatched: "merge",
          whenNotMatched: "discard",
        },
      },
    ] as PipelineStage[];

    const resultsWithRanks = await ResultModel.aggregate(aggregationPipeline);

    await Promise.all(
      resultsWithRanks.map(async (result) => {
        const { _id, rank } = result;
        await ResultModel.findByIdAndUpdate(_id, { rank });
      })
    );

    console.log("Ranks assigned successfully.");

    return NextResponse.json(
      {
        result: "success",
        message: "Ranks assigned successfully.",
        timeTake: (new Date().getTime() - time.getTime()) / 1000 + "s",
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        result: "fail",
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
