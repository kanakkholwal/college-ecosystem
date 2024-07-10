export type Course = {
    name: string;
    code: string;
    cgpi: number;
  };
  export type Semester = {
    sgpi: number;
    cgpi: number;
    courses: Course[];
    semester: number;
    sgpi_total: number;
    cgpi_total: number;
  };
  export type ResultType = {
    name: string;
    rollNo: string;
    branch: string;
    batch: number;
    programme: string;
    semesters: Semester[];
    createdAt?: Date;
    updatedAt?: Date;
  };
  