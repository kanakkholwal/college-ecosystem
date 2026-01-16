import type { Rank } from "~/models/result";

export type studentInfoType = {
  currentSemester: number;
  currentYear: number;
  branch: string;
  batch: number;
  programme: string;
  rollNo: string;
  name: string;
  rank: Rank;
  departmentCode: string;
  roles: string[];
};
