import path from "node:path";
import readXlsxFile from "read-excel-file/node";
import { z } from "zod";
import { getInfoFromRollNo } from "../lib/scrape";
import ResultModel from "../models/result";
import dbConnect from "../utils/dbConnect";

const freshersDataSchema = z.array(
  z.object({
    name: z.string(),
    rollNo: z.string(),
    gender: z.enum(["male", "female", "not_specified"]),
  })
);

function getStudentData(rows: string[][]) {
  const sanitized_data = [];
  const rows_info = new Map([
    [0, "rollNo"],
    [1, "name"],
    // [4, "gender"],
  ]);
  for (const row of rows) {
    const data = {} as Record<string, string>;
    for (let i = 0; i < row.length; i++) {
      const key = rows_info.get(i);
      if (key) {
        if (key === "rollNo") {
          data[key] = row[i].toLowerCase().trim();
        } else {
          data[key] = row[i].trim();
        }
      }
      if (i === row.length - 1) {
        data["gender"] = "not_specified";
      }
    }
    // console.log(data);
    if (!data["name"] || !data["rollNo"]) {
      console.log("Skipping row due to missing name or roll number:", row);
      continue;
    }
    sanitized_data.push(data);
  }
  // remove duplicates based on roll number
  const unique_data = Array.from(
    new Map(sanitized_data.map((item) => [item.rollNo, item])).values()
  );
  // console.log(
  //   `Total rows: ${rows.length}, Sanitized rows: ${sanitized_data.length}, Unique rows: ${unique_data.length}`,
  //   unique_data.slice(0, 5)
  // );
  return unique_data;
}

async function importFreshers(ENV: "production" | "testing", filePath: string) {
  try {
    const time = new Date();
    await dbConnect(ENV);

    const rows = await readXlsxFile(path.join(__dirname, filePath));
    const sanitized_rows = rows
      .filter((row) => row.every((cell) => cell !== null))
      .map((row) => row.map((cell) => cell.toString())).slice(1);

    const sanitized_data = getStudentData(sanitized_rows);
    // return;
    const parsedData = freshersDataSchema.safeParse(sanitized_data);
    if (!parsedData.success) {
      console.log({
        error: true,
        message: "Invalid data",
        data: parsedData.error,
      });
      process.exit(0);
      return;
    }
    console.log("valid Schema");
    const getSanitizedData = () => parsedData.data?.map(async (student) => {
      const data = await getInfoFromRollNo(student.rollNo);
      return {
        name: student.name,
        rollNo: student.rollNo,
        branch: data.branch,
        batch: data.batch,
        programme: data.programme,
        gender: student.gender,
        semesters: [],
      };
    });
    // verify the data against the schema and set the required keys

    const results = await Promise.all(getSanitizedData());
    await ResultModel.deleteMany({
      $or: [
        { batch: 2025 },
        { batch: 0 },
        { batch: "2025" }
      ]
    });
    const resultsWithRanks = await ResultModel.insertMany(results);

    console.log("Freshers imported successfully.");

    console.log({
      error: false,
      message: "Freshers imported successfully.",
      data: {
        timeTaken: `${(new Date().getTime() - time.getTime()) / 1000}s`,
        lastUpdated: new Date().toISOString(),
        results: `${resultsWithRanks.length} freshers imported`,
      },
    });
    process.exit(1);
  } catch (error) {
    console.log(error);
    console.log({
      error: true,
      message: "An error occurred",
      data: error || "Internal Server Error",
    });
    process.exit(0);
  }
}

importFreshers("testing", "./freshers.xlsx");
