import { z } from "zod";

export const applicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  collegeId: z.string().email("Invalid email").refine(email => email.endsWith("@nith.ac.in"), {
    message: "Must be a valid NITH email"
  }),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits")
    .refine(mobile => mobile.length === 10 || mobile.length === 0, {
      message: "Mobile number must be exactly 10 digits"
    }).optional(),
  collegeYear: z.enum(["1st", "2nd", "3rd", "4th"]),
  workLinks: z.array(
    z.object({
      url: z.string().url("Invalid URL format")
    })
  ).min(1, "At least one work link is required"),

  bestProject: z.string().max(2000).optional(),
  bestHack: z.string().max(2000).optional()
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;