import z from "zod";

export interface Department {
  name: string;
  code: string;
  short: string;
  roll_keys: string[];
  course_prefix: string;
  page: string;
}

export const DEPARTMENTS_LIST: readonly Department[] = [
  {
    name: "Computer Science and Engineering",
    code: "cse",
    short: "CSE",
    roll_keys: ["bcs", "dcs", "mcs"],
    course_prefix: "CS",
    page: "https://nith.ac.in/computer-science-engineering",
  },
  {
    name: "Electronics and Communication Engineering",
    code: "ece",
    short: "ECE",
    roll_keys: ["bec", "dec", "mec"],
    course_prefix: "EC",
    page: "https://nith.ac.in/electronics-communication-engineering",
  },
  {
    name: "Electrical Engineering",
    code: "ee",
    short: "EE",
    roll_keys: ["bee", "mee"],
    course_prefix: "EE",
    page: "https://nith.ac.in/electrical-engineering",
  },
  {
    name: "Mechanical Engineering",
    code: "me",
    short: "ME",
    roll_keys: ["bme", "mme"],
    course_prefix: "ME",
    page: "https://nith.ac.in/mechanical-engineering",
  },
  {
    name: "Civil Engineering",
    code: "ce",
    short: "CE",
    roll_keys: ["bce", "mce"],
    course_prefix: "CE",
    page: "https://nith.ac.in/Departments/topic/130",
  },
  {
    name: "Chemical Engineering",
    code: "che",
    short: "CHE",
    roll_keys: ["bch", "mch"],
    course_prefix: "CH",
    page: "https://nith.ac.in/chemistry",
  },
  {
    name: "Materials Science and Engineering",
    code: "mse",
    short: "MSE",
    roll_keys: ["bms", "mms"],
    course_prefix: "MS",
    page: "https://nith.ac.in/material-science-engineering",
  },
  {
    name: "Mathematics & Scientific Computing",
    code: "mnc",
    short: "MNC",
    roll_keys: ["bma", "mma"],
    course_prefix: "MA",
    page: "https://nith.ac.in/mathematics-scientific-computing",
  },
  {
    name: "Architecture",
    code: "arc",
    short: "ARC",
    roll_keys: ["bar", "mar"],
    course_prefix: "AR",
    page: "https://nith.ac.in/Departments/topic/287",
  },
  {
    name: "Engineering Physics",
    code: "phy",
    short: "PHY",
    roll_keys: ["bph", "mph"],
    course_prefix: "PH",
    page: "https://nith.ac.in/physics-photonics-science",
  },
] as const;

export const DEPARTMENTS: readonly string[] = DEPARTMENTS_LIST.map(
  (dept) => dept.name
);
export const DEPARTMENT_CODES: readonly string[] = DEPARTMENTS_LIST.map(
  (dept) => dept.code
);

export const getDepartmentName = (code: string) => {
  const department = DEPARTMENTS_LIST.find((dept) => dept.code === code);
  return department ? department.name : "other";
};

export const getDepartmentCode = (name: string) => {
  const department = DEPARTMENTS_LIST.find((dept) => dept.name === name);
  return department ? department.code : "other";
};

export const getDepartmentShort = (code: string) => {
  const department = DEPARTMENTS_LIST.find((dept) => dept.code === code);
  return department ? department.short : "";
};

export const getDepartmentCoursePrefix = (course_prefix: string) => {
  const department = DEPARTMENTS_LIST.find(
    (dept) => dept.course_prefix === course_prefix
  );
  return department ? department.name : "";
};

export const getDepartmentByRollNo = (rollNo: string) => {
  if (!isValidRollNumber(rollNo)) {
    return "other";
  }
  const matches = [
    rollNo.toLowerCase().substring(0, 2),
    rollNo.toLowerCase().substring(2, 5),
    rollNo.toLowerCase().substring(5, 8),
  ];
  for (const dept of DEPARTMENTS_LIST) {
    if (dept.roll_keys.includes(matches[1])) {
      return dept.name;
    }
  }
};

export const rollNoSchema = z
  .string()
  .regex(/^\d{2}[a-z]{3}\d{3}$/i)
  .refine(
    (rollNo) => {
      const numericPart = Number.parseInt(rollNo.slice(-3));
      return numericPart >= 1 && numericPart <= 999;
    },
    {
      message: "Invalid roll number",
    }
  );

export function isValidRollNumber(rollNo: string): boolean {
  try {
    const response = rollNoSchema.safeParse(rollNo);
    return response.success;
  } catch {
    return false;
  }
}