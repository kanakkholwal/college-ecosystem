import { z } from "zod";
import { orgConfig } from "~/project.config";
import { formatNumberOrdinal } from "~/utils/number";

export const ROLES_ENUMS = {
  ADMIN: "admin",
  STUDENT: "student",
  CR: "cr",
  FACULTY: "faculty",
  HOD: "hod",
  ASSISTANT: "assistant",
  MMCA: "mmca",
  WARDEN: "warden",
  ASSISTANT_WARDEN: "assistant_warden",
  CHIEF_WARDEN: "chief_warden",
  LIBRARIAN: "librarian",
  STAFF: "staff",
  GUARD: "guard",
} as const;

export const ROLES: readonly string[] = Object.values(ROLES_ENUMS);

export const ROLES_MAP = Object.fromEntries(
  Object.entries(ROLES).map(([key, value]) => [value, key])
);

export const ALLOWED_ROLES = [
  ROLES_ENUMS.ADMIN,
  ROLES_ENUMS.FACULTY,
  ROLES_ENUMS.CR,
  ROLES_ENUMS.FACULTY,
  ROLES_ENUMS.CHIEF_WARDEN,
  ROLES_ENUMS.WARDEN,
  ROLES_ENUMS.ASSISTANT_WARDEN,
  ROLES_ENUMS.MMCA,
  ROLES_ENUMS.HOD,
  ROLES_ENUMS.GUARD,
  ROLES_ENUMS.LIBRARIAN,
  ROLES_ENUMS.STUDENT,
  "dashboard"
];

// export const DASHBOARD_ROLES = [

// ]
export const GENDER = {
  MALE: "male",
  FEMALE: "female",
  NOT_SPECIFIED: "not_specified",
};
export const GENDER_ENUMS = Object.values(GENDER);
export const genderSchema = z.enum(["male", "female", "not_specified"]);

export const emailSchema = z
  .string()
  .email({ message: "Invalid email address" })
  .max(100, { message: "Email cannot exceed 100 characters" })
  .refine((val) => val.endsWith(`@${orgConfig.domain}`), {
    message: `Email must end with @${orgConfig.domain}`,
  });

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
export const isValidRollNumber = (rollNo: string): boolean => {
  return rollNoSchema.safeParse(rollNo).success;
};

const passwordSettings = {
  minLength: 8,
  minUppercase: 1,
  minLowercase: 1,
  minNumbers: 1,
  minSpecialChars: 1,
  specialChars: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/,
  uppercaseRegex: /[A-Z]/g,
  lowercaseRegex: /[a-z]/g,
  numbersRegex: /[0-9]/g,
};

export const passwordSchema = z
  .string()
  .min(passwordSettings.minLength)
  .refine(
    (password) =>
      (password.match(passwordSettings.uppercaseRegex) || []).length >=
      passwordSettings.minUppercase,
    {
      message: `Password must contain at least ${passwordSettings.minUppercase} uppercase letter`,
    }
  )
  .refine(
    (password) =>
      (password.match(passwordSettings.lowercaseRegex) || []).length >=
      passwordSettings.minLowercase,
    {
      message: `Password must contain at least ${passwordSettings.minLowercase} lowercase letter`,
    }
  )
  .refine(
    (password) =>
      (password.match(passwordSettings.numbersRegex) || []).length >=
      passwordSettings.minNumbers,
    {
      message: `Password must contain at least ${passwordSettings.minNumbers} number`,
    }
  )
  .refine(
    (password) =>
      passwordSettings.specialChars.test(password) &&
      (password.match(passwordSettings.specialChars) || []).length >=
        passwordSettings.minSpecialChars,
    {
      message: `Password must contain at least ${passwordSettings.minSpecialChars} special character`,
    }
  );

export const Programmes = {
  dual_degree: {
    name: "Dual Degree",
    scheme: "dualdegree",
    identifiers: ["dcs", "dec"],
    duration: 5,
  },
  btech: {
    name: "B.Tech",
    scheme: "scheme",
    identifiers: [
      "bce",
      "bme",
      "bms",
      "bma",
      "bph",
      "bee",
      "bec",
      "bcs",
      "bch",
    ],
    duration: 4,
  },
  barch: {
    name: "B.Arch",
    scheme: "scheme",
    identifiers: ["bar"],
    duration: 5,
  },
  mtech: {
    name: "M.Tech",
    scheme: "mtech",
    identifiers: [
      "mce",
      "mme",
      "mms",
      "mma",
      "mph",
      "mee",
      "mec",
      "mcs",
      "mch",
    ],
    duration: 2,
  },
};

export const getProgrammeByIdentifier = (
  identifier: string,
  defaultBTech: boolean
): (typeof Programmes)[keyof typeof Programmes] => {
  for (const programme of Object.values(Programmes)) {
    if (programme.identifiers.includes(identifier)) {
      if (
        defaultBTech &&
        programme.scheme === Programmes["dual_degree"].scheme
      ) {
        return Programmes["btech"]; // Return B.Tech if defaultBTech is true
      }
      return programme.name ? programme : Programmes["btech"]; // Default to B.Tech if no name is found
    }
  }
  return Programmes["btech"];
};
export const getAcademicYear = (rollNo: z.infer<typeof rollNoSchema>) => {
  const year = Number.parseInt(rollNo.slice(0, 2));
  const programme = getProgrammeByIdentifier(
    rollNo.toLowerCase().substring(2, 5),
    false
  );
  const currentYearFirstTwoDigits = new Date()
    .getFullYear()
    .toString()
    .slice(0, 2); // Get first two digits of current year
  const batchYear = year + programme.duration;
  const currentYear = new Date().getFullYear() % 100; // Get last two digits of current year
  return {
    start: currentYearFirstTwoDigits + year,
    end: currentYearFirstTwoDigits + batchYear,
    label: `${currentYearFirstTwoDigits + year}-${batchYear}`,
    year:
      batchYear - currentYear + 1 > 0
        ? formatNumberOrdinal(batchYear - currentYear + 1)
        : "Pass out",
  };
};
