import { z } from "zod";
import { orgConfig } from "~/project.config";

export const emailSchema = z
  .string()
  .email()
  .refine((val) => val.endsWith(`@${orgConfig.domain}`), {
    message: `Email must end with @${orgConfig.domain}`,
  });

export const createHostelSchema = z.object({
  name: z.string(),
  slug: z.string(),
  gender: z.enum(["male", "female", "guest_hostel"]),
  administrators: z.array(
    z.object({
      email: emailSchema,
      role: z.enum(["warden", "mmca", "assistant_warden"]),
      userId: z.string().nullable(),
    })
  ),
  warden: z.object({
    name: z.string(),
    email: emailSchema,
    userId: z.string().nullable(),
  }),
  students: z.array(z.string()),
});

export const updateHostelSchema = z.object({
  administrators: z.array(
    z.object({
      email: emailSchema,
      role: z.enum(["warden", "mmca", "assistant_warden"]),
      userId: z.string().nullable(),
    })
  ),
  warden: z.object({
    name: z.string(),
    email: emailSchema,
    userId: z.string().nullable(),
  }),
  students: z.array(emailSchema),
});

export const updateHostelStudentSchema = z.object({
  students: z.array(emailSchema),
});

export const createHostelStudentSchema = z.object({
  rollNumber: z.string(),
  userId: z.string(),
  name: z.string(),
  email: emailSchema,
  gender: z.enum(["male", "female"]),
  hostel: z.string(),
  roomNumber: z.string(),
  phoneNumber: z.string(),
  banned: z.boolean(),
  bannedTill: z.date().nullable(),
  bannedReason: z.string().nullable(),
});

export const updateHostelAbleStudentSchema = z.object({
  name: z.string().optional(),
  userId: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  hostelId: z.string().optional(),
  roomNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  banned: z.boolean().optional(),
  bannedTill: z.date().nullable().optional(),
  bannedReason: z.string().nullable().optional(),
});

export const CHIEF_WARDEN_MAIL = `cw@${orgConfig.domain}`;

export const IN_CHARGES_EMAILS = [
  {
    gender: "not_specified",
    slug: "*",
    email: CHIEF_WARDEN_MAIL,
    role: "chief_warden",
  },
  {
    gender: "male",
    slug: "himgiri-boys-hostel",
    email: "wardenhimgiri@nith.ac.in",
    role: "warden",
  },
  {
    gender: "male",
    slug: "himgiri-boys-hostel",
    email: "kunjari@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "male",
    slug: "neelkanth-boys-hostel",
    email: "wardenneelkanth@nith.ac.in",
    role: "warden",
  },
  {
    gender: "male",
    slug: "neelkanth-boys-hostel",
    email: "anshulsharma@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "male",
    slug: "himadri-boys-hostel",
    email: "wardenhimadri@nith.ac.in",
    role: "warden",
  },
  {
    gender: "male",
    slug: "himadri-boys-hostel",
    email: "sandeep.phy@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "male",
    slug: "udaygiri-boys-hostel",
    email: "wardenudaygiri@nith.ac.in",
    role: "warden",
  },
  {
    gender: "male",
    slug: "udaygiri-boys-hostel",
    email: "jiwanjot@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "male",
    slug: "kailash-boys-hostel",
    email: "wardenkailash@nith.ac.in",
    role: "warden",
  },
  {
    gender: "male",
    slug: "kailash-boys-hostel",
    email: "akumar@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "male",
    slug: "vindyachal-boys-hostel",
    email: "wardenvindhyachal@nith.ac.in",
    role: "warden",
  },
  {
    gender: "male",
    slug: "vindyachal-boys-hostel",
    email: "mahavir@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "male",
    slug: "dhauladhar-boys-hostel",
    email: "wardendhauladhar@nith.ac.in",
    role: "warden",
  },
  {
    gender: "male",
    slug: "dhauladhar-boys-hostel",
    email: "hammad@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "female",
    slug: "ambika-girls-hostel",
    email: "wardenambika@nith.ac.in",
    role: "warden",
  },
  {
    gender: "female",
    slug: "ambika-girls-hostel",
    email: "bhartibakshi@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "female",
    slug: "parvati-girls-hostel",
    email: "wardenparvati@nith.ac.in",
    role: "warden",
  },
  {
    gender: "female",
    slug: "parvati-girls-hostel",
    email: "sroy@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "female",
    slug: "satpura-&-aravali-girls-hostel",
    email: " wardensatpura@nith.ac.in",
    role: "warden",
  },
  {
    gender: "female",
    slug: "satpura-&-aravali-girls-hostel",
    email: "wardenaravali@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "female",
    slug: "mani-mahesh-girls-hostel",
    email: "wardenmanimahesh@nith.ac.in",
    role: "warden",
  },
  {
    gender: "female",
    slug: "mani-mahesh-girls-hostel",
    email: "rinshu@nith.ac.in",
    role: "assistant_warden",
  },
  {
    gender: "male",
    slug: "shivalik-boys-hostel",
    email: "wardenshivalik@nith.ac.in",
    role: "warden",
  },
] as const;
