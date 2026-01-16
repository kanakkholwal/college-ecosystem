import { determineBranchChange } from "../lib/result_utils";
import ResultModel from "../models/result";
import dbConnect from "../utils/dbConnect";

async function changeBranch(ENV: "production" | "testing") {
  try {
    const startTime = new Date();
    await dbConnect(ENV);

    const results = await ResultModel.find({});

    const bulkOperations = results.map((result) => {
      const [branchChange, department] = determineBranchChange(result);
      const updates = {
        gender: "not_specified",
        branch: result.branch,
      };

      if (branchChange) {
        updates.branch = department;
        console.log(`Branch change detected for ${result.rollNo}`);
      }

      return {
        updateOne: {
          filter: { _id: result._id },
          update: updates,
        },
      };
    });

    // Execute bulk write to minimize database calls
    if (bulkOperations.length > 0) {
      await ResultModel.bulkWrite(bulkOperations);
    }

    console.log({
      error: false,
      message: "Branch change script executed successfully",
      data: {
        timeTaken: `${(new Date().getTime() - startTime.getTime()) / 1000}s`,
        lastUpdated: new Date().toISOString(),
      },
    });

    process.exit(1);
  } catch (error) {
    console.error(error);
    console.log({
      error: true,
      message: "An error occurred",
      data: error || "Internal Server Error",
    });
    process.exit(0);
  }
}

changeBranch("production");
