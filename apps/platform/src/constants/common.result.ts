import type { ResultTypeWithId } from "src/models/result";

export { isValidRollNumber } from "./core.departments";

export function getYear(result: ResultTypeWithId): string | null {
  switch (result.semesters.length) {
    case 0:
    case 1:
      return "First Year";
    case 2:
    case 3:
      return "Second Year";
    case 4:
    case 5:
      return "Third Year";
    case 6:
    case 7:
      return "Final Year";
    case 8:
      return result.programme === "B.Tech" ? "Pass Out" : "Super Final Year";
    case 9:
      return "Super Final Year";
    case 10:
      return "Pass Out";
    default:
      return "Unknown Year";
  }
}
