"use server";
import dbConnect from "src/lib/dbConnect";
import ResultModel, {
  type IResultType,
  type Semester,
} from "src/models/result";

import type { studentInfoType } from "src/types/student";

import { getDepartmentCode } from "~/constants/core.departments";

export async function getStudentInfo(rollNo: string): Promise<studentInfoType> {
  await dbConnect();

  const result = (await ResultModel.findOne({
    rollNo,
  }).lean()) as IResultType | null;

  if (!result) {
    return Promise.reject("Student not found");
  }

  return Promise.resolve({
    currentSemester: result.semesters.length + 1,
    currentYear: getYear(result.semesters, result.programme),
    branch: result.branch,
    batch: result.batch,
    programme: result.programme,
    rollNo: result.rollNo,
    name: result.name,
    rank: result.rank,
    departmentCode: getDepartmentCode(result.branch),
    roles: ["student"],
  });
}

function getYear(semesters: Semester[], programme: string): number {
  switch (semesters.length) {
    case 0:
    case 1:
      return 1;
    case 2:
    case 3:
      return 2;
    case 4:
    case 5:
      return 3;
    case 6:
    case 7:
      return 4;
    case 8:
      return programme === "B.Tech" ? -1 : 5;
    case 9:
      return 5;
    case 10:
      return 6;
    default:
      return -1;
  }
}
