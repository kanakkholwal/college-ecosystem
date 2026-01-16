"use server";

import z from "zod";
import { emailSchema } from "~/constants";
import dbConnect from "~/lib/dbConnect";
import { mailFetch } from "~/lib/fetch-server";
import serverApis from "~/lib/server-apis/server";
import ResultModel from "~/models/result";

export async function getBasicInfo() {
  try {
    await dbConnect();
    const firstRanker = await ResultModel.findOne({ "rank.college": 1 }).lean();
    if (!firstRanker) {
      return Promise.reject("No results found");
    }
    const updatedAt = JSON.parse(JSON.stringify(firstRanker)).updatedAt;

    const [results, branches, batches, hasBacklogs, activeStudents] =
      await Promise.all([
        ResultModel.countDocuments(),
        ResultModel.distinct("branch"),
        ResultModel.distinct("batch"),
        ResultModel.countDocuments({ "semesters.courses.cgpi": 0 }),
        ResultModel.countDocuments({
          $or: [
            {
              programme: "B.Tech",
              "semesters.length": { $lt: 8 },
            },
            {
              programme: "Dual Degree",
              "semesters.length": { $lt: 10 },
            },
          ],
        }),
      ]);

    return Promise.resolve({
      counts: {
        results,
        branches: branches.length,
        batches: batches.length,
        hasBacklogs,
        activeStudents,
      },
      asOf: updatedAt,
    });
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch results");
  }
}

export async function assignRank() {
  try {
    const { data: response } = await serverApis.results.assignRank(undefined);
    if (response?.error) {
      console.log(response);
      return Promise.reject(response.message || "Failed to assign rank");
    }
    return Promise.resolve("Rank assigned successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to assign rank");
  }
}
export async function sendMailUpdate(targets: string[]) {
  const validTargets = targets.filter(
    (target) =>
      emailSchema.safeParse(target.trim()).success ||
      z.string().email().safeParse(target.trim()).success
  );
  if (validTargets.length === 0) {
    return Promise.reject("Invalid email addresses provided");
  }
  try {
    const { data: response } = await mailFetch<{
      data: {
        accepted: string[];
        rejected: string[];
      } | null;
      error?: string | null | object;
    }>("/api/send", {
      method: "POST",
      body: JSON.stringify({
        template_key: "result_update",
        targets: validTargets.map((email) => email.toLowerCase()),
        subject: `NITH Semester Results for ${new Date().getFullYear() - 1}-${new Date().getFullYear()} Batch Now Available`,
        payload: {
          batch:
            "Academic Year " +
            (new Date().getFullYear() - 1) +
            "-" +
            new Date().getFullYear(),
        },
      }),
    });

    if (response?.error || !response?.data) {
      console.log(response);
      return Promise.reject(response?.error || "Failed to send mail");
    }
    return Promise.resolve({
      accepted: response?.data?.accepted || [],
      rejected: response?.data?.rejected || [],
    });
  } catch (err) {
    console.log("Error sending mail:", err);
    return Promise.reject("Failed to send mail");
  }
}

export async function assignBranchChange() {
  try {
    await serverApis.results.assignBranchChange(undefined);
    return Promise.resolve("Branch change fixed successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fix branch change");
  }
}
export async function getAbnormalResults() {
  try {
    const response = await serverApis.results.getAbnormalResults(undefined)
    console.log("Abnormal Results:", response);

    if (response?.error) {
      console.error(response);
      return Promise.reject(
        response.message || "Failed to fetch abnormal results"
      );
    }
    if (!response?.data) {
      console.log("No abnormal results found", response);
      return Promise.resolve([]);
    }
    return Promise.resolve(response.data);
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch abnormal results");
  }
}

const availableMethods = [
  "getResultByRollNoFromSite",
  "getResultByRollNo",
  "addResultByRollNo",
  "updateResultByRollNo",
] as const;

export async function getResultByRollNo(
  rollNo: string,
  method: (typeof availableMethods)[number]
) {
  try {
    if (method === "getResultByRollNoFromSite") {
      const res = await serverApis.results.getResultByRollNoFromSite(rollNo);
      console.log("Response from getResultByRollNoFromSite:", res);
      return Promise.resolve(res.data);
    } else if (method === "getResultByRollNo") {
      const { data: response } =
        await serverApis.results.getResultByRollNo(rollNo);
      return Promise.resolve(response);
    } else if (method === "addResultByRollNo") {
      const { data: response } =
        await serverApis.results.addResultByRollNo(rollNo);
      return Promise.resolve(response);
    } else if (method === "updateResultByRollNo") {
      const { data: response } = await serverApis.results.updateResultByRollNo([
        rollNo,
        {},
      ]);
      return Promise.resolve(response);
    }
  } catch (err) {
    console.log(err);
    return Promise.reject("Failed to fetch result by roll number");
  }
}
