import { NextRequest, NextResponse } from "next/server";
import { ScrapeResult } from "src/controllers/scraper";
import dbConnect from "src/lib/dbConnect";
import ResultModel from "src/models/result";

export async function POST(request: NextRequest) {
  try {
    const time = new Date();
    // await dbConnect();
    // await scrapeAndUpdateAllResults()
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

async function scrapeAndUpdateResult(rollNo: string) {
  try {
    const result = await ScrapeResult(rollNo);
    await ResultModel.updateOne(
      { rollNo },
      { $set: { semesters: result.semesters } },
      { upsert: false }
    );
    console.log(`Updated ${rollNo}`);
  } catch (error: any) {
    console.error(`Error scraping ${rollNo}: ${error.message}`);
  }
}

async function scrapeAndUpdateAllResults() {
  try {
    console.log("Fetching results from database...");
    const results = await ResultModel.find({});

    const chunkSize = 50; // Process 50 documents at a time
    const chunks = [];
    for (let i = 0; i < results.length; i += chunkSize) {
      chunks.push(results.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      const promises = chunk.map((result) =>
        scrapeAndUpdateResult(result.rollNo)
      );
      await Promise.all(promises);
    }
  } catch (error: any) {
    console.error("Error fetching results from database:", error.message);
  }
}
