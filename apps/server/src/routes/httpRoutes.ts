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
  importFreshers,
  updateResult,
} from "../controllers/http-result";
import { resultScrapingSSEHandler } from "../controllers/sse-scraping";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/** UTILS ENDPOINTS */

// Endpoint to get all the departments from the database
router.get("/departments", getDepartments);
router.get("/departments/list", getDepartmentsList);

// Endpoint to get all the faculties from the database
router.get("/faculties/search/:email", getFacultyByEmailHandler);
router.get("/faculties/refresh", refreshFacultyListHandler);
router.get("/faculties/:departmentCode", getFacultyListByDepartmentHandler);

// Endpoint to get all the functionaries from the site
router.get(
  "/hostels",
  getFunctionaryListByHostelHandler as unknown as RequestHandler
);
// Endpoint to allot rooms to new students
router.post(
  "/hostels/allotment/rooms-from-excel",
  upload.single("file"), allotRoomsFromExcel as unknown as RequestHandler);
/** RESULT ENDPOINTS */
// Endpoint to import freshers results from the json data
router.post(
  "/results/import-freshers",
  importFreshers as unknown as RequestHandler
);
// Endpoint to create new batch using previous batch 
router.post(
  "/results/create-batch",
  createBatchUsingPrevious as unknown as RequestHandler
);
// Endpoint to assign ranks to the results in the database
router.post(
  "/results/assign-ranks",
  assignRankToResults
);
router.post(
  "/results/assign-branch-change",
  assignBranchChangeToResults as unknown as RequestHandler
);
// Endpoint to get result by rollNo scraped from the website
router.get("/results/abnormals", getAbnormalResults);
router.delete("/results/abnormals", deleteAbNormalResults);
// Endpoint to [get,add,update,delete] result by rollNo from the database
router.post("/results/bulk/update", bulkUpdateResults);
router.post("/results/bulk/delete", bulkDeleteResults);
// Endpoint to get result by rollNo scraped from the website
router.get("/results/scrape-sse", resultScrapingSSEHandler as unknown as RequestHandler);

router.post("/results/:rollNo/scrape", getResultByRollNoFromSite);
// Endpoint to [get,add,update] result by rollNo from the database
router.get("/results/:rollNo", getResult);
router.post("/results/:rollNo", addResult);
router.put("/results/:rollNo", updateResult);
router.delete("/results/:rollNo", deleteResult);




export default router;
