import axios from "axios";
import HTMLParser from "node-html-parser";
import {
  getDepartmentCoursePrefix,
  getDepartmentName,
  isValidRollNumber,
} from "../constants/departments";
import {
  getProgrammeByIdentifier,
  LIST_TYPE,
  type listType,
} from "../constants/result_scraping";
import { type headerMap, HeaderSchemaModel } from "../models/header";
import ResultModel from "../models/result";
import type { rawResultType } from "../types/result";
import dbConnect from "../utils/dbConnect";
import { scrapeResult } from "./scrape";
import { sleep } from "./utils";

/**
 * Determines the department based on the roll number.
 * @param RollNo - The roll number of the student.
 * @returns The department name as a string.
 */
// Names come from DEPARTMENTS_LIST so stored branches match branch-change detection and ranking.
export function determineDepartment(RollNo: string) {
  const lowerRollNo = RollNo.toLowerCase();
  switch (true) {
    case lowerRollNo.includes("bar"):
      return getDepartmentName("arc");
    case lowerRollNo.includes("bce"):
      return getDepartmentName("ce");
    case lowerRollNo.includes("bme"):
      return getDepartmentName("me");
    case lowerRollNo.includes("bms"):
      return getDepartmentName("mse");
    case lowerRollNo.includes("bma"):
      return getDepartmentName("mnc");
    case lowerRollNo.includes("bph"):
      return getDepartmentName("phy");
    case lowerRollNo.includes("bee"):
      return getDepartmentName("ee");
    case lowerRollNo.includes("bec") || lowerRollNo.includes("dec"):
      return getDepartmentName("ece");
    case lowerRollNo.includes("bcs") || lowerRollNo.includes("dcs"):
      return getDepartmentName("cse");
    case lowerRollNo.includes("bch"):
      return getDepartmentName("che");
    // case (lowerRollNo.includes("bhs")):
    //     return "Humanities and Social Sciences"
    default:
      throw Error("No Similar branch");
  }
}
/**
 *
 * @param rollNo - The roll number of the student.
 * @returns The programme name as a string.
 */
export function determineProgramme(rollNo: string): string {
  const programmeCode = rollNo.toLowerCase().substring(2, 5);

  return getProgrammeByIdentifier(programmeCode, false).name;
}

/** Batch, branch and programme from the roll number alone. Throws if it can't be resolved. */
export function getStudentInfoFromRollNo(rollNo: string) {
  const batchCode = Number.parseInt(rollNo.substring(0, 2), 10);
  // TODO: validate roll no format more strictly AFTER 2030 is introduced
  if (Number.isNaN(batchCode) || batchCode < 20) {
    throw new Error("Invalid Roll No");
  }
  return {
    batch: 2000 + batchCode,
    branch: determineDepartment(rollNo),
    programme: determineProgramme(rollNo),
  };
}
/**
 * Determines if a student has changed their branch based on their results.
 * @param result - The raw result data of the student.
 * @returns A tuple containing a boolean indicating if the branch has changed and the new department name if applicable.
 */

export function determineBranchChange(
  result: rawResultType
): [boolean, string | null] {
  if (result.semesters.length <= 2) {
    return [false, null];
  }

  const semesters = result.semesters.slice(2);
  const course_codes = semesters.flatMap((semester) =>
    semester.courses.map((course) => course.code)
  );
  // get the unique course codes
  const unique_course_codes = [...new Set(course_codes)];
  //  get the unique courses with prefix
  const unique_courses_prefix = unique_course_codes.map(
    (course_code: string) => course_code.toUpperCase().split("-")[0]
  );
  // count the number of courses with the same prefix using hashmap
  const course_count = unique_courses_prefix.reduce(
    (acc, course) => {
      acc[course] = (acc[course] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  //  get the highest count of the courses
  const max_courses = Math.max(...Object.values(course_count));
  // get the course prefix with the highest count
  const course_prefix = Object.keys(course_count).find(
    (course) => course_count[course] === max_courses
  );
  const department = getDepartmentCoursePrefix(course_prefix || "");
  if (
    !(department.trim() === "") &&
    department !== "other" &&
    department !== result.branch
  ) {
    return [true, department];
  }
  return [false, null];
}

const localCache = new Map<string, headerMap>();
// Concurrent rows of one scheme share a single fetch, so the scheme is scraped and saved once.
const inFlightHeaders = new Map<string, Promise<headerMap>>();

/** Errors whose message is safe to hand back to the caller. */
class HeaderError extends Error {}

async function loadHeaders(scheme: string): Promise<headerMap> {
  await dbConnect();
  const existingHeader = await HeaderSchemaModel.findOne({ scheme });
  if (existingHeader) return existingHeader.toObject();

  const header = {
    url: `http://results.nith.ac.in/${scheme}/studentresult/result.asp`,
    scheme,
    Referer: `http://results.nith.ac.in/${scheme}/studentresult/index.asp`,
    CSRFToken: "",
    RequestVerificationToken: "",
  };
  const response = await axios.get(header.Referer);
  const document = HTMLParser.parse(response.data.toString());
  header.CSRFToken =
    document.querySelector('input[name="CSRFToken"]')?.getAttribute("value") ||
    "";
  header.RequestVerificationToken =
    document
      .querySelector('input[name="RequestVerificationToken"]')
      ?.getAttribute("value") || "";
  if (!header.CSRFToken || !header.RequestVerificationToken) {
    throw new HeaderError("Failed to fetch CSRF tokens");
  }
  // Upsert: another process may have saved this scheme meanwhile, and scheme is a unique index.
  const saved = await HeaderSchemaModel.findOneAndUpdate(
    { scheme },
    { $setOnInsert: header },
    { upsert: true, new: true }
  );
  const headers: headerMap = saved.toObject();
  localCache.set(scheme, headers);
  return headers;
}

/**
 *
 * @param rollNo - The roll number of the student.
 * @param defaultBTech - Whether to default to B.Tech if the programme is not found.
 * @returns A promise that resolves to an object containing the headers and any error message.
 */
export async function getResultHeaders(
  rollNo: string,
  defaultBTech = true
): Promise<{
  headers: headerMap | null;
  error: string | null;
}> {
  if (!isValidRollNumber(rollNo)) {
    return {
      headers: null,
      error: "Invalid Roll No",
    };
  }
  const batchCode = Number.parseInt(rollNo.substring(0, 2), 10);
  const programmeCode = rollNo.toLowerCase().substring(2, 5);
  const programme = getProgrammeByIdentifier(programmeCode, defaultBTech);
  const scheme = programme.scheme + batchCode;

  const cached = localCache.get(scheme);
  if (cached) return { headers: cached, error: null };

  let request = inFlightHeaders.get(scheme);
  if (!request) {
    request = loadHeaders(scheme).finally(() => inFlightHeaders.delete(scheme));
    inFlightHeaders.set(scheme, request);
  }
  try {
    return { headers: await request, error: null };
  } catch (error) {
    console.error("Error fetching headers:", error);
    return {
      headers: null,
      error:
        error instanceof HeaderError
          ? error.message
          : "Failed to fetch headers",
    };
  }
}

/**
 * Scrapes the result for a given roll number.
 * @param rollNo - The roll number of the student.
 * @returns A promise that resolves to an object containing the scraped data or an error message.
 */
export async function scrapeAndSaveResult(rollNo: string) {
  try {
    const result = await scrapeResult(rollNo);
    await sleep(500);
    //  check if scraping was failed
    if (result.error || result.data === null) {
      return {
        rollNo,
        success: false,
        error: result.error || "Scraping failed",
      };
    }
    // check if result already exists
    const existingResult = await ResultModel.findOne({ rollNo });
    if (existingResult) {
      existingResult.semesters = result.data.semesters;
      await existingResult.save();
      return { rollNo, success: true, error: null };
    }
    // create new result if not exists
    await ResultModel.create(result.data);
    return { rollNo, success: true, error: null };
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    return {
      rollNo,
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export async function getListOfRollNos(
  list_type: listType
): Promise<Set<string>> {
  await dbConnect();

  switch (list_type) {
    case LIST_TYPE.BACKLOG: {
      const results = await ResultModel.find({ "semesters.courses.cgpi": 0 })
        .allowDiskUse(true)
        .select("rollNo updatedAt")
        .sort("updatedAt");
      return new Set(results.map((r) => r.rollNo));
    }

    case LIST_TYPE.NEW_SEMESTER: {
      const results = await ResultModel.find({
        $expr: {
          $lt: [
            { $size: "$semesters" },
            {
              $switch: {
                branches: [
                  { case: { $eq: ["$programme", "B.Tech"] }, then: 8 },
                  { case: { $eq: ["$programme", "B.Arch"] }, then: 10 },
                  { case: { $eq: ["$programme", "Dual Degree"] }, then: 12 },
                ],
                default: 0,
              },
            },
          ],
        },
      })
        .select("rollNo updatedAt")
        .allowDiskUse(true);
      return new Set(results.map((r) => r.rollNo));
    }

    case LIST_TYPE.DUAL_DEGREE: {
      const results = await ResultModel.find({
        programme: "Dual Degree",
        $expr: { $gt: [{ $size: "$semesters" }, 6] },
      })
        .select("rollNo updatedAt")
        .allowDiskUse(true);
      return new Set(results.map((r) => r.rollNo));
    }

    case LIST_TYPE.NEW_BATCH: {
      const [{ maxBatch }] = await ResultModel.aggregate([
        { $group: { _id: null, maxBatch: { $max: "$batch" } } },
      ]);

      const groups = await ResultModel.aggregate([
        { $match: { batch: maxBatch } },
        { $sort: { rollNo: 1 } },
        {
          $group: {
            _id: { programme: "$programme", branch: "$branch" },
            minRollNo: { $first: "$rollNo" },
            maxRollNo: { $last: "$rollNo" },
          },
        },
      ]).allowDiskUse(true);

      function extractPrefixSuffix(rollNo: string): {
        prefix: string;
        number: number;
      } {
        const match =
          rollNo.match(/^(\D+)(\d+)$/) || rollNo.match(/^(\d+\D+)(\d+)$/);
        if (!match) throw new Error(`Invalid rollNo format: ${rollNo}`);
        return {
          prefix: match[1],
          number: parseInt(match[2], 10),
        };
      }

      function generateRollNos(
        prefix: string,
        start: number,
        end: number
      ): string[] {
        const rollNos = [];
        for (let i = start; i <= end; i++) {
          rollNos.push(`${prefix}${i.toString().padStart(3, "0")}`);
        }
        return rollNos;
      }

      const rollNoSet = new Set<string>();
      for (const { minRollNo, maxRollNo } of groups) {
        const { prefix, number: startNum } = extractPrefixSuffix(minRollNo);
        const { number: endNum } = extractPrefixSuffix(maxRollNo);

        // next batch rollNos
        const nextPrefix = prefix.replace(/^(\d{2})/, (y) =>
          String(Number(y) + 1).padStart(2, "0")
        );
        generateRollNos(nextPrefix, startNum, endNum).forEach((r) =>
          rollNoSet.add(r)
        );
      }

      return rollNoSet;
    }

    case LIST_TYPE.FRESHERS: {
      // Get the latest batch and have semesters size of 0 or 1
      const [{ maxBatch }] = await ResultModel.aggregate([
        { $group: { _id: null, maxBatch: { $max: "$batch" } } },
      ]);
      const results = await ResultModel.find({
        batch: maxBatch,
        $expr: { $lte: [{ $size: "$semesters" }, 1] },
      })
        .select("rollNo updatedAt")
        .allowDiskUse(true);
      return new Set(results.map((r) => r.rollNo));
    }

    case LIST_TYPE.ALL: {
      const results = await ResultModel.find({})
        .select("rollNo updatedAt")
        .sort("updatedAt")
        .allowDiskUse(true);
      return new Set(results.map((r) => r.rollNo));
    }

    case LIST_TYPE.FULL_RESET: {
      const results = await ResultModel.find({})
        .select("rollNo updatedAt")
        .sort("updatedAt")
        .allowDiskUse(true);
      return new Set(results.map((r) => r.rollNo));
    }
    default:
      return new Set<string>();
  }
}
