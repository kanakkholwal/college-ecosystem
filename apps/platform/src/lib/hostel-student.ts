import { z } from "zod";
import { genderSchema } from "~/constants";
import dbConnect from "~/lib/dbConnect";
import {
  type HostelStudentJson,
  HostelStudentModel,
} from "~/models/hostel_n_outpass";

const getHostelStudentSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  rollNo: z.string(),
  gender: genderSchema.optional(),
  cgpi: z.number(),
});

/**
 * Finds or creates the hostel record for a signing-up student.
 * Unauthenticated by design, so it lives outside "use server" files where it would be a public action.
 */
export async function getHostelStudent(
  payload: z.infer<typeof getHostelStudentSchema>
): Promise<HostelStudentJson | null> {
  const response = getHostelStudentSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("Invalid hostel student payload");
  }
  const data = response.data;

  try {
    await dbConnect();
    const hostelStudent = await HostelStudentModel.findOne({
      email: data.email,
    }).lean();

    if (!hostelStudent) {
      const hostel = new HostelStudentModel({
        name: data.name,
        email: data.email,
        rollNumber: data.rollNo,
        position: "none",
        roomNumber: "UNKNOWN",
        gender: data.gender,
        cgpi: data.cgpi,
        hostelId: null,
      });
      await hostel.save();
      return JSON.parse(JSON.stringify(hostel));
    }
    return JSON.parse(JSON.stringify(hostelStudent));
  } catch (err) {
    console.error("Failed to fetch student", err);
    return null;
  }
}
