import { PipelineStage } from "mongoose";

const assignRank: PipelineStage[] = [
    // Match valid documents
    {
        $match: {
            semesters: { $exists: true, $ne: [], $type: "array" },
            latestCgpi: { $gte: 0 }
        }
    },
    // Sort using indexed field
    { $sort: { latestCgpi: -1, _id: 1 } },
    
    // College rank
    { $group: { _id: null, results: { $push: "$$ROOT" } } },
    { $unwind: { path: "$results", includeArrayIndex: "collegeRank" } },
    { $set: { "results.rank.college": { $add: ["$collegeRank", 1] } } },
    
    // Batch rank
    { $group: { _id: "$results.batch", results: { $push: "$results" } } },
    { $unwind: { path: "$results", includeArrayIndex: "batchRank" } },
    { $set: { "results.rank.batch": { $add: ["$batchRank", 1] } } },
    
    // Branch rank
    {
        $group: {
            _id: { batch: "$results.batch", branch: "$results.branch" },
            results: { $push: "$results" },
        },
    },
    { $unwind: { path: "$results", includeArrayIndex: "branchRank" } },
    { $set: { "results.rank.branch": { $add: ["$branchRank", 1] } } },
    
    // Class rank
    {
        $group: {
            _id: { batch: "$results.batch", branch: "$results.branch" },
            results: { $push: "$results" },
        },
    },
    { $unwind: { path: "$results", includeArrayIndex: "classRank" } },
    { $set: { "results.rank.class": { $add: ["$classRank", 1] } } },
    
    { $replaceRoot: { newRoot: "$results" } },
    {
        $project: {
            _id: 1,
            rank: 1
        }
    }
];

//LEGACY: 

// const assignRank: PipelineStage[] = [
//     {
//         $set: {
//             latestCgpi: {
//                 $let: {
//                     vars: { lastSem: { $arrayElemAt: ["$semesters", -1] } },
//                     in: "$$lastSem.cgpi"
//                 }
//             }
//         }
//     },
//     { $sort: { latestCgpi: -1 } },
//     { $group: { _id: null, results: { $push: "$$ROOT" } } },
//     { $unwind: { path: "$results", includeArrayIndex: "collegeRank" } },
//     { $set: { "results.rank.college": { $add: ["$collegeRank", 1] } } },
//     { $group: { _id: "$results.batch", results: { $push: "$results" } } },
//     { $unwind: { path: "$results", includeArrayIndex: "batchRank" } },
//     { $set: { "results.rank.batch": { $add: ["$batchRank", 1] } } },
//     {
//         $group: {
//             _id: { batch: "$results.batch", branch: "$results.branch" },
//             results: { $push: "$results" },
//         },
//     },
//     { $unwind: { path: "$results", includeArrayIndex: "branchRank" } },
//     { $set: { "results.rank.branch": { $add: ["$branchRank", 1] } } },
//     {
//         $group: {
//             _id: { batch: "$results.batch", branch: "$results.branch" },
//             results: { $push: "$results" },
//         },
//     },
//     { $unwind: { path: "$results", includeArrayIndex: "classRank" } },
//     { $set: { "results.rank.class": { $add: ["$classRank", 1] } } },
//     { $replaceRoot: { newRoot: "$results" } },
//     { $unset: ["latestSemester", "latestCgpi"] },
//     {
//         $merge: {
//             into: "results",
//             whenMatched: "merge",
//             whenNotMatched: "discard",
//         },
//     },
// ];
const abnormalResults: PipelineStage[] = [
    {
        $match: {
            semesters: { $type: "array" },
        },
    },
    {
        $addFields: {
            semesterCount: { $size: "$semesters" },
        },
    },
    {
        $group: {
            _id: { programme: "$programme", batch: "$batch" },
            avgSemesterCount: { $avg: "$semesterCount" },
            docs: { $push: "$$ROOT" },
        },
    },
    {
        $unwind: "$docs",
    },
    {
        $replaceRoot: {
            newRoot: {
                $mergeObjects: ["$docs", { avgSemesterCount: "$avgSemesterCount" }],
            },
        },
    },
    {
        $addFields: {
            diff: { $abs: { $subtract: ["$semesterCount", "$avgSemesterCount"] } },
        },
    },
    {
        $match: {
            diff: { $gte: 2 },
        },
    },
    {
        $project: {
            name: 1,
            rollNo: 1,
            programme: 1,
            batch: 1,
            semesterCount: 1,
            avgSemesterCount: 1,
        },
    },
]

const assignBranchChange: PipelineStage[] = [
      {
        $project: {
          _id: 1,
          rollNo: 1,
          branch: 1,
          semesters: { $slice: ["$semesters", 2, { $size: "$semesters" }] },
        },
      },
      {
        $addFields: {
          courseCodes: {
            $reduce: {
              input: "$semesters",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this.courses.code"] },
            },
          },
        },
      },
      {
        $addFields: {
          uniquePrefixes: {
            $map: {
              input: { $setUnion: "$courseCodes" },
              as: "code",
              in: { $toUpper: { $split: ["$$code", "-"][0] } },
            },
          },
        },
      },
      {
        $unset: ["semesters", "courseCodes"], // Remove intermediate fields to avoid schema changes
      },
]
export const pipelines = {
    "abnormal-results": abnormalResults,
    "assign-rank": assignRank,
    "assign-branch-change": assignBranchChange,
} as const;