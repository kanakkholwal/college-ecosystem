import { scrapeResult } from "../lib/scrape";
import { sleep } from "../lib/utils";
import ResultModel from "../models/result";
import dbConnect from "../utils/dbConnect";

const BATCH_SIZE = 8;

async function scrapeAndSaveResult(rollNo: string) {
  try {
    const result = await scrapeResult(rollNo);
    await sleep(500);
    //  check if scraping was failed
    if (result.error || result.data === null) {
      return { rollNo, success: false };
    }
    // check if result already exists
    const existingResult = await ResultModel.findOne({ rollNo });
    if (existingResult) {
      existingResult.semesters = result.data.semesters;
      existingResult.name = result.data.name;
      await existingResult.save();
      return { rollNo, success: true };
    }
    // create new result if not exists
    await ResultModel.create(result.data);
    return { rollNo, success: true };
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    return { rollNo, success: false };
  }
}
const taskData = {
  processable: 0,
  processed: 0,
  success: 0,
  failed: 0,
  successfulRollNos: [] as string[],
  failedRollNos: [] as string[],
};

const updateResult = async (ENV: "production" | "testing") => {
  try {
    console.log("Updating results");
    await dbConnect(ENV);

    const results = await ResultModel.find({
      $expr: {
        $lt: [{ $size: "$semesters" }, 8],
      },
      batch: 2024,
    }).select("rollNo");
    console.log(results.length);
    const rollArray = results.map((result) => result.rollNo);
    console.log(`Updating ${rollArray.length} results`);
    taskData.processable = rollArray.length;

    for (let i = 0; i < rollArray.length; i += BATCH_SIZE) {
      const batch = rollArray.slice(i, i + BATCH_SIZE);
      await sleep(1000);
      console.log(`Updating batch ${i / BATCH_SIZE + 1}`);
      // Execute scrapeAndSaveResult in parallel for the current batch
      const batchResults = await Promise.allSettled(
        batch.map((rollNo) => scrapeAndSaveResult(rollNo))
      );

      batchResults.forEach((result, index) => {
        const rollNo = batch[index];
        if (result.status === "fulfilled" && result.value.success) {
          taskData.success++;
          taskData.successfulRollNos = [...taskData.successfulRollNos, rollNo];
        } else {
          taskData.failed++;
          taskData.failedRollNos = [...taskData.failedRollNos, rollNo];
        }
        if (taskData.processable > taskData.processed) taskData.processed += 1;

        console.log(
          `Task: Processed ${taskData.processed} of ${taskData.processable} roll numbers.`
        );
        console.log(
          `Task: Success: ${taskData.success}, Failed: ${taskData.failed}`
        );
        console.log(
          `Task: Success Rate: ${((taskData.success / taskData.processed) * 100).toFixed(2)}%`
        );
        console.log(
          `Task: Failed Rate: ${((taskData.failed / taskData.processed) * 100).toFixed(2)}%`
        );
        console.log(`Task: Last Roll Number: ${rollNo}`);
        console.log(
          `Task: Progress: ${(taskData.processed / taskData.processable) * 100}%`
        );
        console.log("---------------------------------");
        console.log("failedRollNos:", taskData.failedRollNos);
      });
    }
    process.exit(1);
  } catch (e) {
    console.log("Error:", e);

    process.exit(0);
  }
};

updateResult("production");
