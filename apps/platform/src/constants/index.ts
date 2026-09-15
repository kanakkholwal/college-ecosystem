import { z } from "zod";
import { orgConfig } from "~/project.config";
import { formatNumberOrdinal } from "~/utils/number";
import type { rollNoSchema } from "./core.departments";

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
  // Primary `users.role` value only; it is not in the `user_roles_enum` Postgres type.
  MODERATOR: "moderator",
} as const;

// Feeds the other_roles pickers, whose values must exist in `user_roles_enum`.
export const ROLES: readonly string[] = Object.values(ROLES_ENUMS).filter(
  (role) => role !== ROLES_ENUMS.MODERATOR
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
  "dashboard",
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

export { isValidRollNumber, rollNoSchema } from "./core.departments";

/** The one rule set for any new password (sign up, reset, settings). Every character is allowed. */
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  // Better Auth rejects passwords over 128 characters.
  .max(128, "Use at most 128 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number");

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
