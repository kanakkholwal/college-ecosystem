// TODO: Create $lib/models/result or move the Rank type here once the models are migrated
// import type { Rank } from "$lib/models/result";

// Inline the Rank type until the models layer is ported
export type Rank = {
  college: number;
  batch: number;
  branch: number;
};

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
