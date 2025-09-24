"use server";
import type { ResultTypeWithId } from "~/models/result";

import { z } from "zod";
import dbConnect from "~/lib/dbConnect";
import { serverFetch } from "~/lib/fetch-server";
import redis from "~/lib/redis";
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
    limit?: number;
    include_freshers?: boolean;
  },
  new_cache?: boolean
): Promise<getResultsReturnType> {
  try {
    // Try Redis GET

    const cacheKey = `results_${filter ? `_${JSON.stringify(Object.entries(filter).sort())}_${query}_${currentPage}` : ""}`;

    let cachedResults: getResultsReturnType | null = null;
    if (!new_cache) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log("Cache hit for key:", cacheKey);
          cachedResults = JSON.parse(cachedData) as getResultsReturnType;
        }
      } catch (redisGetErr) {
        console.log("Redis GET error:", redisGetErr);
      }
    } else {
      try {
        await redis.del(cacheKey);
      } catch (redisDelErr) {
        console.log("Redis DEL error:", redisDelErr);
      }
    }

    if (cachedResults) {
      return cachedResults;
    }
    await dbConnect();
    const resultsPerPage = filter?.limit || 32;
    const skip = currentPage * resultsPerPage - resultsPerPage;

    // biome-ignore lint/suspicious/noExplicitAny: legacy query compatibility
    const filterQuery: any = {
      $or: [
        { rollNo: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    };

    if (filter.branch && filter.branch !== "all") {
      filterQuery.branch = filter.branch;
    }

    if (filter.programme && filter.programme !== "all") {
      filterQuery.programme = filter.programme;
    }

    if (filter.batch && filter.batch.toString() !== "all") {
      filterQuery.batch = filter.batch;
    }
    if (!filter.include_freshers) {
      filterQuery.$expr = { $gt: [{ $size: "$semesters" }, 0] };
    }

    const results = await ResultModel.find({
      ...filterQuery,
    })
      .sort({ "rank.college": "asc" })
      .skip(skip)
      .limit(resultsPerPage)
      .exec();

    const totalPages = Math.ceil(
      (await ResultModel.countDocuments(filterQuery)) / resultsPerPage
    );

    const response = { results, totalPages };

    // Try Redis SET
    try {
      await redis.set(
        cacheKey,
        JSON.stringify(response),
        "EX",
        60 * 60 * 24 // 1 week
      );
      console.log("Results cached successfully");
    } catch (redisSetErr) {
      console.log("Redis SET error:", redisSetErr);
    }

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
    if (!new_cache) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log("Cache hit for key:", cacheKey);
          cachedLabels = JSON.parse(cachedData) as CachedLabels;
        }
      } catch (redisGetErr) {
        console.log("Redis GET error:", redisGetErr);
      }
    } else {
      try {
        await redis.del(cacheKey);
        console.log("Cache cleared for key:", cacheKey);
      } catch (redisDelErr) {
        console.log("Redis DEL error:", redisDelErr);
      }
    }

    if (!cachedLabels) {
      await dbConnect();
      const branches = await ResultModel.distinct("branch");
      const batches = await ResultModel.distinct("batch");
      const programmes = await ResultModel.distinct("programme");

      cachedLabels = { branches, batches, programmes };

      try {
        await redis.set(
          cacheKey,
          JSON.stringify(cachedLabels),
          "EX",
          60 * 60 * 24 * 30 * 6 // 6 months
        );
        console.log("Cached labels set successfully");
      } catch (redisSetErr) {
        console.log("Redis SET error:", redisSetErr);
      }
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
  const cacheKey = `result_r_${rollNo}`;
  try {
    let cachedResult: ResultTypeWithId | null = null;
    if (!is_new && !update) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log("Cache hit for key:", cacheKey);
          cachedResult = JSON.parse(cachedData) as ResultTypeWithId;
        }
      } catch (redisGetErr) {
        console.log("Redis GET error:", redisGetErr);
      }
    } else {
      try {
        await redis.del(cacheKey);
        console.log("Cache cleared for key:", cacheKey);
      } catch (redisDelErr) {
        console.log("Redis DEL error:", redisDelErr);
      }
    }
  } catch (error) {
    console.log("Cache Error in getResultByRollNo:", error);
  }
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
  // cache the result
  if (!result) {
    console.log("Result not found for rollNo:", rollNo);
    return JSON.parse(JSON.stringify(null));
  }
  try {
    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      60 * 15 // 15 minutes
    );
    console.log("Result cached successfully for rollNo:", rollNo);
  } catch (redisSetErr) {
    console.log("Redis SET error:", redisSetErr);
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
