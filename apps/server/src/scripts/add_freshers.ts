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

function getStudentData(rows: string[][], forceGender?: "male" | "female") {
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
        } else if (key === "name") {
          data[key] = row[i].trim();
        }
      }
      if (i === row.length - 1) {
        data["gender"] = forceGender || "not_specified";
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

async function getDataFromFile(filePath: string) {
  const rows = await readXlsxFile(path.join(__dirname, filePath));
  // const sanitized_rows = rows
  //   .filter((row) => row.every((cell) => cell !== null))
  //   .map((row) => row.map((cell) => cell.toString())).slice(1);
  const sanitized_rows = rows
    .filter((row) => row.some((cell) => cell !== null)) // keep if at least one non-null cell
    .map((row) => row.map((cell) => (cell ? cell.toString() : "")))
    .slice(1);
  return sanitized_rows;
}

async function importFreshers(ENV: "production" | "testing", filePaths: {
  path: string;
  forceGender?: "male" | "female";
}[]) {
  try {
    const time = new Date();

    const sanitized_rows = await Promise.all(filePaths.map(filePath => getDataFromFile(filePath.path)));

    const sanitized_data = await Promise.all(sanitized_rows.map((rows, index) => getStudentData(rows, filePaths[index].forceGender))).then(dataArrays => dataArrays.flat());

    // return;
    console.log("Sanitized Data", sanitized_data.slice(0, 5));
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
    await dbConnect(ENV);

    const results = await Promise.all(getSanitizedData());
    await ResultModel.deleteMany({
      $or: [
        { batch: 2025 },
        { batch: 0 },
        { batch: "0" },
        { batch: "2025" }
      ]
    });
    const ops = results.map((student) => ({
      updateOne: {
        filter: { rollNo: student.rollNo }, // unique key
        update: { $set: student },
        upsert: true,
      },
    }));

    const resultsWithRanks = await ResultModel.bulkWrite(ops);

    console.log("Freshers imported successfully.");

    console.log({
      error: false,
      message: "Freshers imported successfully.",
      data: {
        timeTaken: `${(new Date().getTime() - time.getTime()) / 1000}s`,
        lastUpdated: new Date().toISOString(),
        results: `${resultsWithRanks.ok} freshers imported`,
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

importFreshers("production", [
  {
    path: "./Boys.xlsx",
    forceGender: "male"
  },
  {
    path: "./Girls.xlsx",
    forceGender: "female"
  }
]);
