import dbConnect from "~/lib/dbConnect";
import ResultModel from "~/models/result";

async function main() {
  await dbConnect("production");

  console.log("Creating indexes...");
  await Promise.all([
    ResultModel.collection.createIndex({ rollNo: 1 }, { unique: true }),
    ResultModel.collection.createIndex({ "rank.college": 1, _id: -1 }),
    ResultModel.collection.createIndex({ branch: 1, batch: 1 }),
    ResultModel.collection.createIndex({ name: "text" }),
    ResultModel.collection.createIndex({ updatedAt: -1 }),
  ]);

  console.log("✅ Indexes created successfully");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Index creation failed:", err);
  process.exit(1);
});
