"use server";
import { z } from "zod";
import dbConnect from "~/lib/dbConnect";
import redis from "~/lib/redis";
import { serverFetch } from "~/lib/server-fetch";
import type { ResultTypeWithId } from "~/models/result";
import ResultModel from "~/models/result";

/*
/*  For Public Search
*/

type getResultsReturnType = {
  results: ResultTypeWithId[];
  totalPages: number;
};

export async function getResults(
  query: string,
  currentPage: number,
  filter: {
    branch?: string;
    programme?: string;
    batch?: number;
  },
  new_cache?: boolean
): Promise<getResultsReturnType> {
  try {
    await dbConnect();
    const resultsPerPage = 32;
    const skip = currentPage * resultsPerPage - resultsPerPage;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const filterQuery: any = {
      $or: [
        { rollNo: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    };

    // Apply filters if provided and not equal to "all"
    if (filter.branch && filter.branch !== "all") {
      filterQuery.branch = filter.branch;
    }

    if (filter.programme && filter.programme !== "all") {
      filterQuery.programme = filter.programme;
    }

    if (filter.batch && filter.batch.toString() !== "all") {
      filterQuery.batch = filter.batch;
    }

    // Check cached results
    const cacheKey = `results_${query}_${currentPage}${filter ? `_${JSON.stringify(filter)}` : ""}`;
    let cachedResults = null;
    try {
      if (!new_cache)
        cachedResults = await redis.get(cacheKey) as getResultsReturnType | null;
      else {
        await redis.del(cacheKey);
      }
    } catch (redisError) {
      console.error("Redis connection error:", redisError);
    }

    if (cachedResults) {
      return cachedResults;
    }

    const results = await ResultModel.find({
      ...filterQuery,
      $expr: { $gt: [{ $size: "$semesters" }, 0] }, // Add the condition here
    })
      .sort({ "rank.college": "asc" })
      .skip(skip)
      .limit(resultsPerPage)
      .exec();

    const totalPages = Math.ceil(
      (await ResultModel.countDocuments(filterQuery)) / resultsPerPage
    );

    const response = { results, totalPages };

    // Cache the query results for 1 week
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 60 * 60 * 24 * 7);

    return response;
  } catch (error) {
    console.error("Error fetching results:", error);
    throw new Error("Failed to fetch results. Please try again later.");
  }
}

type CachedLabels = {
  branches: string[];
  batches: string[];
  programmes: string[];
};

export async function getCachedLabels(
  new_cache?: boolean
): Promise<CachedLabels> {
  const cacheKey = "cached_labels";
  let cachedLabels: CachedLabels | null = null;
  try {
    try {
      if (!new_cache) 
        cachedLabels = await redis.get(cacheKey) as CachedLabels | null;
      else 
      await redis.del(cacheKey);
    } catch (redisError) {
      console.error("Redis connection error:", redisError);
    }
    if (!cachedLabels) {
      await dbConnect();
      const branches = await ResultModel.distinct("branch");
      const batches = await ResultModel.distinct("batch");
      const programmes = await ResultModel.distinct("programme");

      cachedLabels = { branches, batches, programmes };

      // Cache labels for 6 months
      await redis.set(cacheKey, JSON.stringify(cachedLabels), 'EX', 60 * 60 * 24 * 30 * 6);
    }
  } catch (error) {
    console.error("Error fetching cached labels:", error);
    return { branches: [], batches: [], programmes: [] };
  }
  return cachedLabels || { branches: [], batches: [], programmes: [] };
}

/*
/*  For admin
*/

export async function getResultByRollNo(
  rollNo: string,
  update?: boolean,
  is_new?: boolean
): Promise<ResultTypeWithId | null> {
  await dbConnect();
  const result = await ResultModel.findOne({
    rollNo,
  }).exec();
  if (result && update) {
    const response = await serverFetch<{
      data: ResultTypeWithId | null;
      message: string;
      error: boolean;
    }>("/api/results/:rollNo/update", {
      method: "POST",
      params: { rollNo },
    });
    if (response.error || !response.data) {
      return JSON.parse(JSON.stringify(null));
    }
    await assignRanks();
    return JSON.parse(JSON.stringify(response.data.data));
  }
  if (!result && is_new) {
    const response = await serverFetch<{
      data: ResultTypeWithId | null;
      message: string;
      error: boolean;
    }>("/api/results/:rollNo/add", {
      method: "POST",
      params: { rollNo },
    });
    if (response.error || !response.data) {
      return JSON.parse(JSON.stringify(null));
    }
    await assignRanks();

    return JSON.parse(JSON.stringify(response.data.data));
  }
  return JSON.parse(JSON.stringify(result));
}

export async function assignRanks() {
  const response = await serverFetch<{
    error: boolean;
    message: string;
    data: object | null;
  }>("/api/results/assign-ranks", {
    method: "POST",
  });
  console.log(response);
  if (!response.data || response.data?.error) {
    return Promise.reject(response.data?.message);
  }

  return Promise.resolve(true);
}

const freshersDataSchema = z.array(
  z.object({
    name: z.string(),
    rollNo: z.string(),
    gender: z.enum(["male", "female", "not_specified"]),
  })
);
export async function bulkUpdateGenders(
  data: z.infer<typeof freshersDataSchema>
) {
  try {
    const parsedData = freshersDataSchema.safeParse(data);
    if (!parsedData.success) {
      console.log("not success");
      return {
        error: true,
        message: "Invalid data",
        data: parsedData.error,
      };
    }
    await dbConnect();

    const batchSize = 8;
    for (let i = 0; i < parsedData.data.length; i += batchSize) {
      const batch = parsedData.data.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(async (student) => {
          const result = await ResultModel.findOne({ rollNo: student.rollNo });
          if (result && result.gender === "not_specified") {
            result.gender = student.gender;
            console.log(student.gender);
            await result.save();
          }
        })
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return Promise.resolve(true);
  } catch (e) {
    console.error(e);
    return Promise.resolve(false);
  }
}
