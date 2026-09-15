import { type RequestHandler, Router } from "express";
import multer from "multer";
import { allotRoomsFromExcel } from "../controllers/http-allotment";
import {
  getDepartments,
  getDepartmentsList,
} from "../controllers/http-department";
import {
  getFacultyByEmailHandler,
  getFacultyListByDepartmentHandler,
  refreshFacultyListHandler,
} from "../controllers/http-faculty_list";
import { getFunctionaryListByHostelHandler } from "../controllers/http-hostel";
import {
  addResult,
  assignBranchChangeToResults,
  assignRankToResults,
  bulkDeleteResults,
  bulkUpdateResults,
  createBatchUsingPrevious,
  deleteAbNormalResults,
  deleteResult,
  getAbnormalResults,
  getResult,
  getResultByRollNoFromSite,
  getResultsByBatch,
  importFreshers,
  updateResult,
} from "../controllers/http-result";
import { resultScrapingSSEHandler } from "../controllers/sse-scraping";
import { facultyRefreshLimiter, scrapeLimiter } from "../utils/rate-limit";

const router = Router();
// Buffered in memory, so cap the upload before it can exhaust the process.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

/** UTILS ENDPOINTS */

// Endpoint to get all the departments from the database
router.get("/departments", getDepartments);
router.get("/departments/list", getDepartmentsList);

// Endpoint to get all the faculties from the database
router.get("/faculties/search/:email", getFacultyByEmailHandler);
router.get(
  "/faculties/refresh",
  facultyRefreshLimiter,
  refreshFacultyListHandler
);
router.get("/faculties/:departmentCode", getFacultyListByDepartmentHandler);

// Endpoint to get all the functionaries from the site
router.get(
  "/hostels",
  getFunctionaryListByHostelHandler as unknown as RequestHandler
);
// Endpoint to allot rooms to new students
router.post(
  "/hostels/allotment/rooms-from-excel",
  upload.single("file"),
  allotRoomsFromExcel as unknown as RequestHandler
);
/** RESULT ENDPOINTS */
// Endpoint to import freshers results from the json data
router.post(
  "/results/import-freshers",
  scrapeLimiter,
  importFreshers as unknown as RequestHandler
);
// Endpoint to create new batch using previous batch
router.post(
  "/results/create-batch",
  scrapeLimiter,
  createBatchUsingPrevious as unknown as RequestHandler
);
// Endpoint to assign ranks to the results in the database
router.post("/results/assign-ranks", scrapeLimiter, assignRankToResults);
router.post(
  "/results/assign-branch-change",
  scrapeLimiter,
  assignBranchChangeToResults as unknown as RequestHandler
);
// Endpoint to get result by rollNo scraped from the website
router.get("/results/abnormals", getAbnormalResults);
router.delete("/results/abnormals", deleteAbNormalResults);
// Endpoint to [get,add,update,delete] result by rollNo from the database
router.post("/results/bulk/update", scrapeLimiter, bulkUpdateResults);
router.post("/results/bulk/delete", scrapeLimiter, bulkDeleteResults);
// Endpoint to get result by rollNo scraped from the website
router.get(
  "/results/scrape-sse",
  scrapeLimiter,
  resultScrapingSSEHandler as unknown as RequestHandler
);

// Endpoint to get results by batch as CSV
router.get("/results/batch/:batch", getResultsByBatch);

router.post(
  "/results/:rollNo/scrape",
  scrapeLimiter,
  getResultByRollNoFromSite
);
// Endpoint to [get,add,update] result by rollNo from the database
router.get("/results/:rollNo", getResult);
router.post("/results/:rollNo", addResult);
router.put("/results/:rollNo", updateResult);
router.delete("/results/:rollNo", deleteResult);

export default router;
