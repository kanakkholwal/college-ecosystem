"use server";

import { format } from "date-fns";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "~/auth";
import { genderSchema, ROLES_ENUMS } from "~/constants";
import {
  createHostelSchema,
  createHostelStudentSchema,
  updateHostelAbleStudentSchema,
  updateHostelSchema,
  updateHostelStudentSchema,
} from "~/constants/hostel_n_outpass";
import dbConnect from "~/lib/dbConnect";
import serverApis from "~/lib/server-apis/server";
import {
  HostelModel,
  type HostelStudentJson,
  HostelStudentModel,
  type HostelStudentType,
  type HostelType,
  type IHostelType,
} from "~/models/hostel_n_outpass";
import ResultModel from "~/models/result";
import { orgConfig } from "~/project.config";

const allowedRolesForHostel = [
  ROLES_ENUMS.ADMIN,
  ROLES_ENUMS.STUDENT,
  ROLES_ENUMS.ASSISTANT_WARDEN,
  ROLES_ENUMS.WARDEN,
];
type allowedRolesForHostelType = (typeof allowedRolesForHostel)[number];
/*
    Hostel Actions
*/

export async function createHostel(data: z.infer<typeof createHostelSchema>) {
  try {
    const response = createHostelSchema.safeParse(data);
    if (!response.success) {
      return { error: response.error };
    }
    await dbConnect();
    const newHostel = new HostelModel(data);
    await newHostel.save();
    return { success: true };
  } catch (err) {
    return { error: err };
  }
}

export async function createHostelStudent(
  data: z.infer<typeof createHostelStudentSchema>
) {
  try {
    const response = createHostelStudentSchema.safeParse(data);
    if (!response.success) {
      return { error: response.error };
    }
    await dbConnect();
    const newStudent = new HostelStudentModel(data);
    await newStudent.save();
    return { success: true };
  } catch (err) {
    return { error: err };
  }
}

export async function updateHostel(
  slug: string,
  data:
    | Partial<z.infer<typeof updateHostelSchema>>
    | z.infer<typeof updateHostelStudentSchema>,
  studentsOnly?: boolean
) {
  try {
    if (studentsOnly) {
      const response = updateHostelStudentSchema.safeParse(data);
      if (!response.success) {
        return Promise.reject("Invalid schema has passed");
      }
    } else {
      const response = updateHostelSchema.safeParse(data);
      if (!response.success) {
        return Promise.reject("Invalid schema has passed");
      }
    }
    console.log("valid schema");

    const hostel = (await HostelModel.findOne({
      slug,
    }).lean()) as IHostelType | null;
    if (!hostel) {
      return Promise.reject("Hostel not found");
    }

    await dbConnect();
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let changes = { ...data } as any;

    // Convert email list to ObjectId
    if (data?.students) {
      const students = await HostelStudentModel.find({
        email: { $in: data.students },
      })
        .select("_id")
        .lean();

      if (students.length !== (data.students ?? []).length) {
        console.log("syncHostelStudents");
        const response = await syncHostelStudents(
          hostel._id.toString(),
          [...new Set(data.students)]
        );

        if (!response.success) {
          console.log("Failed to sync students", response.error);
          return Promise.reject(response.error);
        }

        if (response?.data) {
          changes.students = response.data.map(
            (student) => new mongoose.Types.ObjectId(student as string)
          );
        } else {
          const { students, ...rest } = changes;
          changes = rest; // Remove `students` if no valid IDs are found
        }
      } else {
        // Use the found student ObjectIds
        changes.students = students.map((student) => student._id);
      }
    }

    await HostelModel.findOneAndUpdate({ slug }, changes, { new: true }).exec();
    return Promise.resolve(`${hostel.name} has been updated`);
  } catch (err) {
    console.log("Failed to update hostel", err);
    return Promise.reject(err?.toString());
  } finally {
    revalidatePath(`/admin/hostels/${slug}`);
  }
}

export async function updateHostelStudent(
  email: string,
  data: z.infer<typeof updateHostelAbleStudentSchema>
): Promise<string> {
  try {
    const response = updateHostelAbleStudentSchema.safeParse(data);
    if (!response.success) {
      return Promise.reject("Invalid schema has passed");
    }
    await dbConnect();
    const hostelStudent = await HostelStudentModel.findOne({ email });
    if (!hostelStudent) {
      return Promise.reject("Hostel student not found");
    }

    // Update the hostel student
    Object.assign(hostelStudent, data);
    if (data.hostelId) {
      hostelStudent.hostelId = data.hostelId;
    }
    await hostelStudent.save();

    return Promise.resolve("Hostel student updated successfully");
  } catch (err) {
    return Promise.reject(err?.toString());
  }
}
async function syncHostelStudents(hostelId: string, studentEmails: string[]) {
  try {
    await dbConnect();
    const hostel = await HostelModel.findById(hostelId);
    if (!hostel) return { success: false, error: "Hostel not found" };

    const existingStudents = await HostelStudentModel.find({
      email: { $in: studentEmails },
    }).lean();

    const rollNumbers = studentEmails.map((email) => email.split("@")[0]);
    const results = await ResultModel.find({
      rollNo: { $in: rollNumbers },
    }).lean();

    const bulkOps = [];
    const resultUpdates = [];

    for await (const email of studentEmails) {
      const student = existingStudents.find((s) => s.email === email);
      const rollNumber = email.split("@")[0];
      const result = results.find((r) => r.rollNo === rollNumber);

      if (student && String(student.hostelId) !== String(hostelId)) {
        bulkOps.push({
          updateOne: {
            filter: { email },
            update: {
              $set: { hostelId, gender: hostel.gender, roomNumber: "UNKNOWN" },
            },
          },
        });

        if (student.gender !== "not_specified") {
          resultUpdates.push({
            updateOne: {
              filter: { rollNo: rollNumber },
              update: { $set: { gender: hostel.gender } },
            },
          });
        }
      } else if (!student && result) {
        bulkOps.push({
          insertOne: {
            document: {
              rollNumber: result.rollNo,
              name: result.name,
              email,
              hostelId,
              gender:
                result.gender !== "not_specified"
                  ? result.gender
                  : hostel.gender,
              roomNumber: "UNKNOWN",
              position: "none",
            },
          },
        });

        if (result.gender === "not_specified") {
          resultUpdates.push({
            updateOne: {
              filter: { rollNo: rollNumber },
              update: { $set: { gender: hostel.gender } },
            },
          });
        }
      }
    }

    if (bulkOps.length) await HostelStudentModel.bulkWrite(bulkOps);
    if (resultUpdates.length) await ResultModel.bulkWrite(resultUpdates);

    // const updatedStudents = await HostelStudentModel.getStudentsByHostel(hostelId);

    return { success: true, data: [] };
  } catch (err) {
    console.error("syncHostelStudents Error:", err);
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to sync students" };
  }
}

export async function getHostel(slug: string): Promise<{
  success: boolean;
  hostel:
  | (HostelType & {
    students: {
      count: number;
    };
  })
  | null;
  error?: object;
}> {
  try {
    await dbConnect();
    const hostel = JSON.parse(
      JSON.stringify(await HostelModel.findOne({ slug }))
    ) as HostelType | null;
    if (!hostel) {
      return Promise.resolve({ success: false, hostel: null });
    }
    const hostelStudents = await HostelStudentModel.countDocuments({
      hostelId: hostel?._id,
    });

    return Promise.resolve({
      success: true,
      hostel: JSON.parse(
        JSON.stringify({
          ...hostel,
          students: {
            count: hostelStudents,
          },
        })
      ),
    });
  } catch (err) {
    return Promise.reject({
      success: false,
      hostel: null,
      error: JSON.parse(JSON.stringify(err)),
    });
  }
}

export async function getHostelById(id: string): Promise<{
  success: boolean;
  hostel: HostelType | null;
  error?: object | null;
}> {
  try {
    await dbConnect();
    const hostel = JSON.parse(
      JSON.stringify(await HostelModel.findById(id).lean())
    ) as HostelType | null;
    if (!hostel) {
      return Promise.resolve({ success: false, hostel: null, error: null });
    }

    return Promise.resolve({
      success: true,
      hostel: JSON.parse(JSON.stringify(hostel)),
      error: null,
    });
  } catch (err) {
    return Promise.reject({
      success: false,
      hostel: null,
      error: JSON.parse(JSON.stringify(err)),
    });
  }
}
interface getHostelByUserType {
  success: boolean;
  message: string;
  hostel: HostelType | null;
  hosteler: HostelStudentType | null;
  inCharge: boolean;
}

export async function getHostelByUser(
  slug?: string
): Promise<getHostelByUserType> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    if (!session) {
      return Promise.resolve({
        success: false,
        hostel: null,
        message: "Session not found",
        hosteler: null,
        inCharge: false,
      });
    }
    const is_allowed =
      session?.user?.other_roles?.some((role) =>
        allowedRolesForHostel.includes(role as allowedRolesForHostelType)
      ) ||
      allowedRolesForHostel.includes(
        session?.user?.role as allowedRolesForHostelType
      );
    if (!is_allowed) {
      return Promise.resolve({
        success: false,
        hostel: null,
        message: "User is not access hostel features",
        hosteler: null,
        inCharge: false,
      });
    }
    await dbConnect();
    // (special) : if user is admin
    if (session.user.role === ROLES_ENUMS.ADMIN && slug) {
      console.log("if user is admin and slug is present");
      const hostel = await HostelModel.findOne({ slug }).lean();
      if (!hostel) {
        return Promise.resolve({
          success: false,
          hostel: null,
          message: "Hostel not found",
          hosteler: null,
          inCharge: true,
        });
      }
      return Promise.resolve({
        success: true,
        hostel: JSON.parse(JSON.stringify(hostel)),
        message: "User is allowed to access hostel features",
        hosteler: null,
        inCharge: true,
      });
    }

    const orConditions = [];
    if (session?.user?.hostelId !== "not_specified") {
      orConditions.push({
        _id: new mongoose.Types.ObjectId(session?.user?.hostelId as string),
      });
    }
    orConditions.push(
      { "warden.email": session.user.email as string },
      { "warden.email": { $in: session.user?.other_emails || [] } },
      { "administrators.email": session.user.email as string },
      { "administrators.email": { $in: session.user?.other_emails || [] } }
    );

    const hostel = (await HostelModel.findOne({
      $or: orConditions,
    }).lean()) as HostelType | null;
    if (!hostel) {
      console.log("Hostel not found for user", session.user.email);
      // Check if user is a hosteler
      return Promise.resolve({
        success: false,
        hostel: null,
        message: "Hostel not found",
        hosteler: null,
        inCharge: false,
      });
    }
    // Check if user is a student
    if (session.user.other_roles?.includes(ROLES_ENUMS.STUDENT)) {
      const hostelerStudent = (await HostelStudentModel.findOne({
        email: session.user.email,
        // userId: session.user.id,
        hostelId: hostel._id,
      })
        .populate("hostelId", "_id name slug gender")
        .select("+name")
        .lean()) as HostelStudentType | null;
      // console.log("hostelerStudent", hostelerStudent);
      if (hostelerStudent) {
        // Check if user is a student of the hostel
        const hostel = await HostelModel.findById(
          hostelerStudent.hostelId
        ).lean();
        if (!hostel) {
          return Promise.resolve({
            success: false,
            hostel: null,
            message: "Hostel mis-match for the hosteler",
            hosteler: JSON.parse(JSON.stringify(hostelerStudent)),
            inCharge: false,
          });
        }

        if (hostelerStudent.banned) {
          return Promise.resolve({
            success: false,
            hostel: JSON.parse(JSON.stringify(hostel)),
            message: `User is banned from accessing hostel features till ${hostelerStudent.bannedTill ? format(new Date(hostelerStudent.bannedTill), "dd/MM/yyyy HH:mm:ss") : "unknown"}`,
            hosteler: JSON.parse(JSON.stringify(hostelerStudent)),
            inCharge: false,
          });
        }

        return Promise.resolve({
          success: true,
          hostel: JSON.parse(JSON.stringify(hostel)),
          message: "User is allowed to access hostel features",
          hosteler: JSON.parse(JSON.stringify(hostelerStudent)),
          inCharge: false,
        });
      }
    }
    return Promise.resolve({
      success: true,
      hostel: JSON.parse(JSON.stringify(hostel)),
      message: "User is allowed to access hostel features",
      hosteler: null,
      inCharge: true,
    });
  } catch (err) {
    console.log("Failed to fetch hostel", err);
    return Promise.reject("Failed to fetch hostel");
  }
}

export async function getHostelForStudent(
  slug?: string
): Promise<getHostelByUserType> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    if (!session) {
      return Promise.resolve({
        success: false,
        hostel: null,
        message: "Session not found",
        hosteler: null,
        inCharge: false,
      });
    }
    // Check if user has access to hostel features
    if (
      !session?.user?.other_roles?.includes(ROLES_ENUMS.STUDENT) &&
      session?.user?.role !== ROLES_ENUMS.ADMIN
    ) {
      return Promise.resolve({
        success: false,
        hostel: null,
        message: "User is not access hostel features or is not a student",
        hosteler: null,
        inCharge: false,
      });
    }
    await dbConnect();
    // (special) : if user is admin
    if (session.user.role === ROLES_ENUMS.ADMIN && slug) {
      console.log("if user is admin and slug is present");
      const hostel = await HostelModel.findOne({ slug }).lean();
      if (!hostel) {
        return Promise.resolve({
          success: false,
          hostel: null,
          message: "Hostel not found for admin (slug provided: " + slug + ")",
          hosteler: null,
          inCharge: true,
        });
      }
      return Promise.resolve({
        success: true,
        hostel: JSON.parse(JSON.stringify(hostel)),
        message: "User is allowed to access hostel features",
        hosteler: null,
        inCharge: true,
      });
    }

    if (
      session?.user?.hostelId === "not_specified" ||
      !session?.user?.hostelId ||
      !session?.user?.hostelId?.length
    ) {
      return Promise.resolve({
        success: false,
        hostel: null,
        message: "Student does not have a hostel assigned",
        hosteler: null,
        inCharge: false,
      });
    }

    const hostel = (await HostelModel.findOne({
      _id: new mongoose.Types.ObjectId(session?.user?.hostelId as string),
    }).lean()) as HostelType | null;

    if (!hostel) {
      // Check if user is a hosteler
      return Promise.resolve({
        success: false,
        hostel: null,
        message:
          "Hostel not found for the student (" + session.user.email + ")",
        hosteler: null,
        inCharge: false,
      });
    }
    //  check if HostelStudentModel exists for the user
    const hostelerStudent = await HostelStudentModel.findOne({
      email: session.user.email,
    });
    if (
      session.user.hostelId !== hostel._id.toString() &&
      !hostelerStudent?.hostelId
    ) {
      hostelerStudent.hostelId = hostel._id;
      await hostelerStudent.save();
    }
    if (hostelerStudent) {
      // Check if user is a student of the hostel
      const hostel = await HostelModel.findById(
        hostelerStudent.hostelId
      ).lean();
      if (!hostel) {
        return Promise.resolve({
          success: false,
          hostel: null,
          message:
            "Assigned hostel not found for the hosteler (" +
            session.user.email +
            ")",
          hosteler: JSON.parse(JSON.stringify(hostelerStudent)),
          inCharge: false,
        });
      }

      if (hostelerStudent.banned) {
        return Promise.resolve({
          success: false,
          hostel: JSON.parse(JSON.stringify(hostel)),
          message: `User is banned from accessing hostel features till ${hostelerStudent.bannedTill ? format(new Date(hostelerStudent.bannedTill), "dd/MM/yyyy HH:mm:ss") : "unknown"}`,
          hosteler: JSON.parse(JSON.stringify(hostelerStudent)),
          inCharge: false,
        });
      }

      return Promise.resolve({
        success: true,
        hostel: JSON.parse(JSON.stringify(hostel)),
        message: "User is allowed to access hostel features",
        hosteler: JSON.parse(JSON.stringify(hostelerStudent)),
        inCharge: false,
      });
    }

    return Promise.resolve({
      success: true,
      hostel: JSON.parse(JSON.stringify(hostel)),
      message: "User is allowed to access hostel features",
      hosteler: null,
      inCharge: true,
    });
  } catch (err) {
    console.log("Failed to fetch hostel", err);
    return Promise.reject("Failed to fetch hostel");
  }
}

export async function getHostels(): Promise<{
  success: boolean;
  data: HostelType[];
}> {
  try {
    await dbConnect();
    const hostels = await HostelModel.find({}).lean();
    return Promise.resolve({
      success: true,
      data: JSON.parse(JSON.stringify(hostels)),
    });
  } catch (err) {
    return Promise.resolve({ success: false, data: [] });
  }
}
export async function getHostelsStats(): Promise<{
  success: boolean;
  data: {
    hostels: HostelType[];
    totalStudents: number;
  };
}> {
  try {
    await dbConnect();
    const hostels = await HostelModel.find({}).lean();
    // TODO: optimize count query and add creteria if needed
    const totalStudents = await HostelStudentModel.countDocuments();
    return Promise.resolve({
      success: true,
      data: {
        hostels: JSON.parse(JSON.stringify(hostels)),
        totalStudents,
      },
    });
  } catch (err) {
    return Promise.resolve({
      success: false, data: {
        hostels: [],
        totalStudents: 0
      }
    });
  }
}

export async function importHostelsFromSite() {
  try {
    const res = await serverApis.hostels.getAll(undefined);
    console.log(res);
    if (res?.error) {
      return Promise.reject(
        res?.message || "Some error occurred while fetching hostels"
      );
    }
    await dbConnect();
    const hostels = res?.data?.hostels.map((hostel: any) => {
      return {
        name: hostel.name,
        slug: hostel.slug,
        gender: hostel.gender,
        warden: hostel.warden,
        administrators: hostel.administrators,
        students: [],
      };
    });
    await HostelModel.insertMany(hostels);

    return Promise.resolve(`${hostels.length} hostels imported`);
  } catch (err) {
    console.log("Failed to import hostels", err);
    return Promise.reject("Failed to import hostels");
  } finally {
    revalidatePath("/admin/hostels");
  }
}

type importStudentsPayload = Array<{
  rollNo: string;
  name: string;
  cgpi: number;
}>;

export async function importStudentsWithCgpi(
  hostelId: string,
  payload: importStudentsPayload
): Promise<string> {
  try {
    await dbConnect();
    const hostel = await HostelModel.findById(hostelId);
    if (!hostel) return Promise.reject("Hostel Not Found");

    const rollNumbers = payload.map((student) => student.rollNo);
    const bulkOps = [];
    const resultUpdates = [];

    const existingStudents = await HostelStudentModel.find({
      rollNo: { $in: rollNumbers },
    }).lean();
    const results = await ResultModel.find({
      rollNo: { $in: rollNumbers },
    }).lean();
    for await (const student of payload) {
      const existingStudent = existingStudents.find(
        (s) => s.rollNo === student.rollNo
      );
      const result = results.find((r) => r.rollNo === student.rollNo);

      if (existingStudent) {
        bulkOps.push({
          updateOne: {
            filter: { rollNo: student.rollNo },
            update: {
              $set: {
                hostelId,
                cgpi: student?.cgpi || 0,
                gender: hostel.gender,
              },
            },
          },
        });
      } else {
        bulkOps.push({
          insertOne: {
            document: {
              rollNumber: student.rollNo,
              name: student.name,
              email: `${student.rollNo}@${orgConfig.domain}`,
              hostelId,
              gender: hostel.gender,
              roomNumber: "UNKNOWN",
              position: "none",
              cgpi: student?.cgpi || 0,
            },
          },
        });
      }

      if (result?.gender === "not_specified") {
        resultUpdates.push({
          updateOne: {
            filter: { rollNo: student.rollNo },
            update: { $set: { gender: hostel.gender } },
          },
        });
      }
    }

    if (bulkOps.length) await HostelStudentModel.bulkWrite(bulkOps);
    if (resultUpdates.length) await ResultModel.bulkWrite(resultUpdates);

    return Promise.resolve("Imported successfully");
  } catch (err) {
    console.log("Failed to import students", err);
    return Promise.reject("Failed to import students");
  }
}

export async function getStudentsByHostelId(
  hostelId: string
): Promise<HostelStudentJson[]> {
  try {
    await dbConnect();
    const students = await HostelStudentModel.find({ hostelId })
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();
    return Promise.resolve(JSON.parse(JSON.stringify(students)));
  } catch (err) {
    console.log("Failed to fetch students", err);
    return Promise.reject("Failed to fetch students");
  }
}

export async function getEligibleStudentsForHostel(
  hostelId: string
): Promise<HostelStudentJson[]> {
  try {
    await dbConnect();
    const hostel = (await HostelModel.findById(
      hostelId
    ).lean()) as IHostelType | null;
    if (!hostel) {
      return Promise.reject("Hostel not found");
    }
    const students = await HostelStudentModel.find({
      gender: hostel.gender,
      $or: [{ hostelId: null }],
      $nor: [{ _id: hostel._id }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return Promise.resolve(JSON.parse(JSON.stringify(students)));
  } catch (err) {
    console.log("Failed to fetch eligible students", err);
    return Promise.reject("Failed to fetch eligible students");
  }
}

const getHostelStudentSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  rollNo: z.string(),
  gender: genderSchema,
  cgpi: z.number(),
});

export async function getHostelStudent(
  payload: z.infer<typeof getHostelStudentSchema>
): Promise<HostelStudentJson | null> {
  const response = getHostelStudentSchema.safeParse(payload);
  if (!response.success) {
    return Promise.reject("Invalid schema has passed");
  }
  const data = response.data;

  try {
    //
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
      return Promise.resolve(JSON.parse(JSON.stringify(hostel)));
    }
    return Promise.resolve(JSON.parse(JSON.stringify(hostelStudent)));
  } catch (err) {
    console.log("Failed to fetch student", err);
    return Promise.resolve(null);
  }
}
