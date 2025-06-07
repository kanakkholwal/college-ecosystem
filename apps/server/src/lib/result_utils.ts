import axios from "axios";
import HTMLParser from "node-html-parser";
import { getDepartmentCoursePrefix, isValidRollNumber } from "../constants/departments";
import { getProgrammeByIdentifier } from "../constants/result_scraping";
import { headerMap, HeaderSchemaModel } from "../models/header";
import ResultModel from "../models/result";
import { rawResultType } from "../types/result";
import dbConnect from "../utils/dbConnect";
import { scrapeResult } from "./scrape";

/**
 * Determines the department based on the roll number.
 * @param RollNo - The roll number of the student.
 * @returns The department name as a string.
 */
// This function is used to determine the department based on the roll number.
export function determineDepartment(RollNo: string) {
    const lowerRollNo = RollNo.toLowerCase();
    switch (true) {
        case lowerRollNo.includes("bar"):
            return "Architecture";
        case lowerRollNo.includes("bce"):
            return "Civil Engineering";
        case lowerRollNo.includes("bme"):
            return "Mechanical Engineering";
        case lowerRollNo.includes("bms"):
            return "Materials Science and Engineering";
        case lowerRollNo.includes("bma"):
            return "Mathematics and Computing";
        case lowerRollNo.includes("bph"):
            return "Engineering Physics";
        case lowerRollNo.includes("bee"):
            return "Electrical Engineering";
        case lowerRollNo.includes("bec") || lowerRollNo.includes("dec"):
            return "Electronics and Communication Engineering";
        case lowerRollNo.includes("bcs") || lowerRollNo.includes("dcs"):
            return "Computer Science and Engineering";
        case lowerRollNo.includes("bch"):
            return "Chemical Engineering";
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

    return getProgrammeByIdentifier(programmeCode, false).name
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

const localCache = new Map<string, { headers: headerMap; error: string | null }>();
/**
 * 
 * @param rollNo - The roll number of the student.
 * @param defaultBTech - Whether to default to B.Tech if the programme is not found.
 * @returns A promise that resolves to an object containing the headers and any error message.
 */
export async function getResultHeaders(rollNo: string, defaultBTech = true): Promise<{
    headers: headerMap | null;
    error: string | null;
}> {
    if (!isValidRollNumber(rollNo)) {
        return {
            headers: null,
            error: "Invalid Roll No"
        }
    }
    const matches = [
        Number.parseInt(rollNo.toLowerCase().substring(0, 2)), // 20
        rollNo.toLowerCase().substring(2, 5), // dec,bec,bar
        rollNo.toLowerCase().substring(5, 8), // 001
    ] as const;
    const [batchCode, programmeCode] = matches;
    const programme = getProgrammeByIdentifier(programmeCode, defaultBTech);

    if (localCache.has(programme.scheme + batchCode)) {
        return Promise.resolve(localCache.get(programme.scheme + batchCode)!);
    }

    try {
        // 
        await dbConnect();
        const existingHeader = await HeaderSchemaModel.findOne({
            scheme: programme.scheme + batchCode
        });
        if (existingHeader) {
            return {
                headers: existingHeader.toObject(),
                error: null
            };
        }

        const header: {
            url: string;
            scheme: string;
            Referer: string;
            CSRFToken: string;
            RequestVerificationToken: string;
        } = {
            url: `http://results.nith.ac.in/${programme.scheme + batchCode}/studentresult/result.asp`,
            scheme: programme.scheme + batchCode,
            Referer: `http://results.nith.ac.in/${programme.scheme + batchCode}/studentresult/index.asp`,
            CSRFToken: "",
            RequestVerificationToken: "",
        };
        const response = await axios.get(header.Referer);
        const document = HTMLParser.parse(response.data.toString());
        header.CSRFToken =
            document
                .querySelector('input[name="CSRFToken"]')
                ?.getAttribute("value") || "";
        header.RequestVerificationToken =
            document
                .querySelector('input[name="RequestVerificationToken"]')
                ?.getAttribute("value") || "";
        if (!header.CSRFToken || !header.RequestVerificationToken) {
            return {
                headers: null,
                error: "Failed to fetch CSRF tokens"
            };
        }
        const headerInDb = new HeaderSchemaModel(header);
        await headerInDb.save();
        // Store in local cache
        // This is a simple in-memory cache, consider using a more persistent cache for production use
        localCache.set(programme.scheme + batchCode, {
            headers: headerInDb.toObject(),
            error: null
        });
        return {
            headers: headerInDb.toObject(),
            error: null
        };
    } catch (error) {
        console.error("Error fetching headers:", error);
        // Handle the error appropriately, e.g., log it or return a default value
        return {
            headers: null,
            error: "Failed to fetch headers"
        };
    }


}
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
            return { rollNo, success: false, error: result.error || "Scraping failed" };
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
        return { rollNo, success: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
}