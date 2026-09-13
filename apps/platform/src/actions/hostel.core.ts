"use server";

import { format } from "date-fns";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { genderSchema, ROLES_ENUMS } from "~/constants";
import { isValidRollNumber } from "~/constants/core.departments";
import {
  createHostelSchema,
  updateHostelAbleStudentSchema,
} from "~/constants/hostel_n_outpass";
import dbConnect from "~/lib/dbConnect";
import {
  authorizeHostelManager,
  findStaffHostel,
  getHostelSession,
  hasRole,
  isCampusWide,
} from "~/lib/hostel-access";
import serverApis from "~/lib/server-apis/server";
import { HostelRoomModel } from "~/models/allotment";
import {
  HostelModel,
  type HostelStudentJson,
  HostelStudentModel,
  type HostelStudentType,
  type HostelType,
  OutPassModel,
} from "~/models/hostel_n_outpass";
import ResultModel from "~/models/result";
import { orgConfig } from "~/project.config";

const serialize = <T>(value: unknown): T => JSON.parse(JSON.stringify(value));

async function requireCampusWide() {
  const session = await getHostelSession();
  if (!session?.user || !isCampusWide(session.user)) {
    throw new Error("Only admins and the chief warden can do this");
  }
  return session;
}

export async function createHostel(data: z.infer<typeof createHostelSchema>) {
  try {
    await requireCampusWide();
    const response = createHostelSchema.safeParse(data);
    if (!response.success) {
      return { error: response.error };
    }
    await dbConnect();
    await HostelModel.create(response.data);
    revalidatePath("/[moderator]/hostels", "page");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

// dashboard.admin.ts calls this after its own admin check; the guard keeps the endpoint closed.
export async function updateHostelStudent(
  email: string,
  data: z.infer<typeof updateHostelAbleStudentSchema>
): Promise<string> {
  const session = await getHostelSession();
  if (
    !session?.user ||
    !hasRole(session.user, [
      ROLES_ENUMS.ADMIN,
      "moderator",
      ROLES_ENUMS.CHIEF_WARDEN,
    ])
  ) {
    return Promise.reject("Unauthorized");
  }
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
    Object.assign(hostelStudent, response.data);
    await hostelStudent.save();
    return "Hostel student updated successfully";
  } catch (err) {
    return Promise.reject(err?.toString());
  }
}

export async function getHostel(slug: string): Promise<{
  success: boolean;
  hostel: (HostelType & { students: { count: number } }) | null;
  error?: object;
}> {
  try {
    await dbConnect();
    const hostel = await HostelModel.findOne({ slug }).lean<HostelType>();
    if (!hostel) return { success: false, hostel: null };
    const count = await HostelStudentModel.countDocuments({
      hostelId: hostel._id,
    });
    return {
      success: true,
      hostel: serialize({ ...hostel, students: { count } }),
    };
  } catch (err) {
    console.error("getHostel failed", err);
    return { success: false, hostel: null };
  }
}

export async function getHostelById(id: string): Promise<{
  success: boolean;
  hostel: HostelType | null;
  error?: object | null;
}> {
  try {
    if (!mongoose.isValidObjectId(id)) {
      return { success: false, hostel: null, error: null };
    }
    await dbConnect();
    const hostel = await HostelModel.findById(id).lean();
    if (!hostel) return { success: false, hostel: null, error: null };
    return { success: true, hostel: serialize(hostel), error: null };
  } catch (err) {
    console.error("getHostelById failed", err);
    return { success: false, hostel: null, error: null };
  }
}

interface getHostelByUserType {
  success: boolean;
  message: string;
  hostel: HostelType | null;
  hosteler: HostelStudentType | null;
  inCharge: boolean;
}

const denied = (message: string): getHostelByUserType => ({
  success: false,
  hostel: null,
  message,
  hosteler: null,
  inCharge: false,
});

const bannedMessage = (bannedTill?: Date) =>
  `User is banned from accessing hostel features till ${bannedTill ? format(new Date(bannedTill), "dd/MM/yyyy HH:mm:ss") : "unknown"}`;

async function findHostelerByEmail(email: string) {
  const emails = [...new Set([email.trim(), email.trim().toLowerCase()])];
  return HostelStudentModel.findOne({ email: { $in: emails } })
    .populate("hostelId", "_id name slug gender")
    .lean<HostelStudentType | null>();
}

/**
 * Staff get the hostel that lists their account id or primary email (inCharge);
 * students get the hostel on their own hostel record.
 */
export async function getHostelByUser(
  slug?: string
): Promise<getHostelByUserType> {
  try {
    const session = await getHostelSession();
    if (!session?.user) return denied("Session not found");
    const user = session.user;
    await dbConnect();

    if (slug) {
      const access = await authorizeHostelManager(slug);
      if (access.ok) {
        return {
          success: true,
          hostel: serialize(access.hostel),
          message: "User is allowed to access hostel features",
          hosteler: null,
          inCharge: true,
        };
      }
      if (access.status === 404) return denied(access.error);
    }

    const staffHostel = await findStaffHostel(user);
    if (staffHostel && (!slug || staffHostel.slug === slug)) {
      return {
        success: true,
        hostel: serialize(staffHostel),
        message: "User is allowed to access hostel features",
        hosteler: null,
        inCharge: true,
      };
    }

    const hosteler = await findHostelerByEmail(user.email);
    const hostelRef = hosteler?.hostelId;
    if (!hosteler || !hostelRef) return denied("Hostel not found");
    const hostel = await HostelModel.findById(hostelRef._id).lean();
    if (!hostel || (slug && hostelRef.slug !== slug)) {
      return denied("Hostel not found");
    }
    if (hosteler.banned) {
      return {
        success: false,
        hostel: serialize(hostel),
        message: bannedMessage(hosteler.bannedTill),
        hosteler: serialize(hosteler),
        inCharge: false,
      };
    }
    return {
      success: true,
      hostel: serialize(hostel),
      message: "User is allowed to access hostel features",
      hosteler: serialize(hosteler),
      inCharge: false,
    };
  } catch (err) {
    console.error("Failed to fetch hostel", err);
    return Promise.reject("Failed to fetch hostel");
  }
}

export async function getHostelForStudent(
  slug?: string
): Promise<getHostelByUserType> {
  try {
    const session = await getHostelSession();
    if (!session?.user) return denied("Session not found");
    const user = session.user;
    const isAdmin = user.role === ROLES_ENUMS.ADMIN;
    if (!user.other_roles?.includes(ROLES_ENUMS.STUDENT) && !isAdmin) {
      return denied("User is not access hostel features or is not a student");
    }
    await dbConnect();

    if (isAdmin && slug) {
      const hostel = await HostelModel.findOne({ slug }).lean();
      if (!hostel) return denied("Hostel not found");
      return {
        success: true,
        hostel: serialize(hostel),
        message: "User is allowed to access hostel features",
        hosteler: null,
        inCharge: true,
      };
    }

    const hosteler = await findHostelerByEmail(user.email);
    let hostelId = hosteler?.hostelId?._id?.toString();

    // Admins set users.hostelId; link a record that has none yet.
    if (
      hosteler &&
      !hostelId &&
      user.hostelId &&
      user.hostelId !== "not_specified" &&
      mongoose.isValidObjectId(user.hostelId)
    ) {
      await HostelStudentModel.updateOne(
        { _id: hosteler._id, hostelId: null },
        { $set: { hostelId: user.hostelId } }
      );
      hostelId = user.hostelId;
    }

    if (!hosteler || !hostelId) {
      return denied("Student does not have a hostel assigned");
    }
    const hostel = await HostelModel.findById(hostelId).lean();
    if (!hostel) {
      return {
        ...denied("Assigned hostel not found for the hosteler"),
        hosteler: serialize(hosteler),
      };
    }
    if (hosteler.banned) {
      return {
        success: false,
        hostel: serialize(hostel),
        message: bannedMessage(hosteler.bannedTill),
        hosteler: serialize(hosteler),
        inCharge: false,
      };
    }
    return {
      success: true,
      hostel: serialize(hostel),
      message: "User is allowed to access hostel features",
      hosteler: serialize(hosteler),
      inCharge: false,
    };
  } catch (err) {
    console.error("Failed to fetch hostel", err);
    return Promise.reject("Failed to fetch hostel");
  }
}

export async function getHostels(): Promise<{
  success: boolean;
  data: HostelType[];
}> {
  try {
    await dbConnect();
    const hostels = await HostelModel.find({}).sort({ name: 1 }).lean();
    return { success: true, data: serialize(hostels) };
  } catch {
    return { success: false, data: [] };
  }
}

export async function getHostelsStats(): Promise<{
  success: boolean;
  data: { hostels: HostelType[]; totalStudents: number };
}> {
  try {
    await dbConnect();
    const [hostels, totalStudents] = await Promise.all([
      HostelModel.find({}).sort({ name: 1 }).lean(),
      HostelStudentModel.countDocuments({ hostelId: { $ne: null } }),
    ]);
    return {
      success: true,
      data: { hostels: serialize(hostels), totalStudents },
    };
  } catch {
    return { success: false, data: { hostels: [], totalStudents: 0 } };
  }
}

type SiteHostel = Pick<
  HostelType,
  "name" | "slug" | "gender" | "warden" | "administrators"
>;

export async function importHostelsFromSite() {
  try {
    await requireCampusWide();
    const res = await serverApis.hostels.getAll(undefined);
    if (res?.error) {
      return Promise.reject(
        res?.message || "Some error occurred while fetching hostels"
      );
    }
    const incoming = (res?.data?.hostels ?? []) as unknown as SiteHostel[];
    await dbConnect();
    const existing = await HostelModel.find({
      slug: { $in: incoming.map((h) => h.slug) },
    })
      .select("slug")
      .lean<{ slug: string }[]>();
    const taken = new Set(existing.map((h) => h.slug));
    const fresh = incoming
      .filter((h) => !taken.has(h.slug))
      .map(({ name, slug, gender, warden, administrators }) => ({
        name,
        slug,
        gender,
        warden,
        administrators,
      }));
    if (fresh.length) await HostelModel.insertMany(fresh);
    return fresh.length === 0
      ? "All hostels on the college site are already imported"
      : `${fresh.length} hostels imported`;
  } catch (err) {
    console.error("Failed to import hostels", err);
    return Promise.reject(
      err instanceof Error ? err.message : "Failed to import hostels"
    );
  } finally {
    revalidatePath("/[moderator]/hostels", "page");
  }
}

export type HostelOverviewStats = {
  pendingOutpasses: number;
  outNow: number;
  residents: number;
  banned: number;
  rooms: number;
  beds: number;
  occupiedBeds: number;
};

export async function getHostelOverview(slug: string): Promise<{
  success: boolean;
  data: HostelOverviewStats | null;
  error?: string;
}> {
  const access = await authorizeHostelManager(slug);
  if (!access.ok) return { success: false, data: null, error: access.error };
  try {
    const hostelId = access.hostel._id;
    const [pendingOutpasses, outNow, residents, banned, rooms] =
      await Promise.all([
        OutPassModel.countDocuments({ hostel: hostelId, status: "pending" }),
        OutPassModel.countDocuments({ hostel: hostelId, status: "in_use" }),
        HostelStudentModel.countDocuments({ hostelId }),
        HostelStudentModel.countDocuments({ hostelId, banned: true }),
        HostelRoomModel.aggregate<{
          rooms: number;
          beds: number;
          occupiedBeds: number;
        }>([
          { $match: { hostel: hostelId } },
          {
            $group: {
              _id: null,
              rooms: { $sum: 1 },
              beds: { $sum: "$capacity" },
              occupiedBeds: { $sum: "$occupied_seats" },
            },
          },
        ]),
      ]);
    return {
      success: true,
      data: {
        pendingOutpasses,
        outNow,
        residents,
        banned,
        rooms: rooms[0]?.rooms ?? 0,
        beds: rooms[0]?.beds ?? 0,
        occupiedBeds: rooms[0]?.occupiedBeds ?? 0,
      },
    };
  } catch (err) {
    console.error("getHostelOverview failed", err);
    return { success: false, data: null, error: "Failed to load numbers" };
  }
}

// --- Residents ---

export type HostelResident = {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
  roomNumber: string;
  cgpi: number | null;
  banned: boolean;
  bannedTill: string | null;
};

export async function getHostelResidents(slug: string): Promise<{
  success: boolean;
  data: HostelResident[];
  error?: string;
}> {
  const access = await authorizeHostelManager(slug);
  if (!access.ok) return { success: false, data: [], error: access.error };
  try {
    const residents = await HostelStudentModel.find({
      hostelId: access.hostel._id,
    })
      .select("name rollNumber email roomNumber cgpi banned bannedTill")
      .sort({ rollNumber: 1 })
      .lean();
    return {
      success: true,
      data: serialize<HostelResident[]>(residents).map((r) => ({
        ...r,
        cgpi: typeof r.cgpi === "number" && r.cgpi > 0 ? r.cgpi : null,
        bannedTill: r.bannedTill ?? null,
      })),
    };
  } catch (err) {
    console.error("getHostelResidents failed", err);
    return { success: false, data: [], error: "Failed to load residents" };
  }
}

export async function getStudentsByHostelId(
  hostelId: string
): Promise<HostelStudentJson[]> {
  const access = await authorizeHostelManager(hostelId, "id");
  if (!access.ok) return Promise.reject(access.error);
  try {
    const students = await HostelStudentModel.find({ hostelId })
      .select("-__v")
      .sort({ cgpi: -1, createdAt: 1 })
      .lean();
    return serialize(students);
  } catch (err) {
    console.error("Failed to fetch students", err);
    return Promise.reject("Failed to fetch students");
  }
}

const importRowSchema = z.object({
  rollNo: z
    .string()
    .trim()
    .toLowerCase()
    .refine(isValidRollNumber, "Not a valid roll number"),
  name: z.string().trim().min(2, "Name is missing"),
  cgpi: z.coerce
    .number({ message: "CGPI must be a number" })
    .min(0, "CGPI can't be negative")
    .max(10, "CGPI can't be above 10"),
});

export type ResidentImportRow = { rollNo: string; name: string; cgpi: unknown };

export type ResidentImportRowResult = {
  row: number;
  rollNo: string;
  name: string;
  cgpi: number | null;
  status: "new" | "update" | "move" | "invalid" | "duplicate";
  message?: string;
};

async function planResidentImport(
  hostelId: mongoose.Types.ObjectId,
  rows: ResidentImportRow[]
) {
  const seen = new Set<string>();
  const parsed = rows.map((raw, index) => {
    const result = importRowSchema.safeParse(raw);
    const base = {
      row: index + 1,
      rollNo: String(raw.rollNo ?? "").trim(),
      name: String(raw.name ?? "").trim(),
      cgpi: null as number | null,
    };
    if (!result.success) {
      return {
        ...base,
        status: "invalid" as const,
        message: result.error.issues[0]?.message ?? "Invalid row",
      };
    }
    if (seen.has(result.data.rollNo)) {
      return {
        ...base,
        cgpi: result.data.cgpi,
        status: "duplicate" as const,
        message: "Roll number appears earlier in the file",
      };
    }
    seen.add(result.data.rollNo);
    return { ...base, ...result.data, status: "new" as const };
  });

  const valid = parsed.filter((r) => r.status === "new");
  const rollNos = valid.flatMap((r) => [r.rollNo, r.rollNo.toUpperCase()]);
  const existing = await HostelStudentModel.find({
    rollNumber: { $in: rollNos },
  })
    .select("rollNumber hostelId")
    .populate("hostelId", "name")
    .lean<
      {
        rollNumber: string;
        hostelId: { _id: mongoose.Types.ObjectId; name: string } | null;
      }[]
    >();
  const byRoll = new Map(existing.map((s) => [s.rollNumber.toLowerCase(), s]));

  const plan: (ResidentImportRowResult & { dbRoll?: string })[] = parsed.map(
    (row) => {
      if (row.status !== "new") return row;
      const match = byRoll.get(row.rollNo);
      if (!match) return row;
      const elsewhere =
        match.hostelId && !match.hostelId._id.equals(hostelId)
          ? match.hostelId.name
          : null;
      return {
        ...row,
        dbRoll: match.rollNumber,
        status: elsewhere ? ("move" as const) : ("update" as const),
        message: elsewhere ? `Moves from ${elsewhere}` : undefined,
      };
    }
  );
  return plan;
}

/** Validates a spreadsheet against the database without writing anything. */
export async function previewResidentImport(
  slug: string,
  rows: ResidentImportRow[]
): Promise<{ success: boolean; rows: ResidentImportRowResult[]; error?: string }> {
  const access = await authorizeHostelManager(slug);
  if (!access.ok) return { success: false, rows: [], error: access.error };
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 2000) {
    return {
      success: false,
      rows: [],
      error: "Upload between 1 and 2000 rows",
    };
  }
  try {
    const plan = await planResidentImport(access.hostel._id, rows);
    return { success: true, rows: plan.map(({ dbRoll, ...row }) => row) };
  } catch (err) {
    console.error("previewResidentImport failed", err);
    return { success: false, rows: [], error: "Couldn't check the file" };
  }
}

export async function importResidents(
  slug: string,
  rows: ResidentImportRow[]
): Promise<{
  success: boolean;
  written: number;
  failed: ResidentImportRowResult[];
  error?: string;
}> {
  const access = await authorizeHostelManager(slug);
  if (!access.ok) {
    return { success: false, written: 0, failed: [], error: access.error };
  }
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 2000) {
    return {
      success: false,
      written: 0,
      failed: [],
      error: "Upload between 1 and 2000 rows",
    };
  }
  const { hostel } = access;
  const gender =
    hostel.gender === "male" || hostel.gender === "female"
      ? hostel.gender
      : "not_specified";

  try {
    const plan = await planResidentImport(hostel._id, rows);
    const writable = plan.filter((r) =>
      ["new", "update", "move"].includes(r.status)
    );
    const failed = plan.filter((r) => !writable.includes(r));

    const ops = writable.map((row) =>
      row.status === "new"
        ? {
            insertOne: {
              document: {
                rollNumber: row.rollNo,
                name: row.name,
                email: `${row.rollNo}@${orgConfig.domain}`,
                hostelId: hostel._id,
                gender,
                roomNumber: "UNKNOWN",
                position: "none",
                cgpi: row.cgpi ?? 0,
              },
            },
          }
        : {
            updateOne: {
              filter: { rollNumber: row.dbRoll },
              update: {
                $set: { hostelId: hostel._id, cgpi: row.cgpi ?? 0, gender },
              },
            },
          }
    );

    let written = writable.length;
    if (ops.length) {
      try {
        await HostelStudentModel.bulkWrite(ops, { ordered: false });
      } catch (err) {
        const writeErrors = (
          err as { writeErrors?: { index: number; errmsg?: string }[] }
        ).writeErrors;
        if (!writeErrors) throw err;
        for (const writeError of writeErrors) {
          const row = writable[writeError.index];
          if (!row) continue;
          written -= 1;
          failed.push({
            ...row,
            status: "invalid",
            message: writeError.errmsg?.includes("duplicate key")
              ? "Another record already uses this email or roll number"
              : "Couldn't save this row",
          });
        }
      }
    }

    if (gender !== "not_specified" && written > 0) {
      await ResultModel.updateMany(
        {
          rollNo: { $in: writable.map((r) => r.rollNo) },
          gender: "not_specified",
        },
        { $set: { gender } }
      );
    }

    revalidatePath("/[moderator]/h/[slug]/students", "page");
    return {
      success: true,
      written,
      failed: failed
        .map(({ dbRoll, ...row }) => row)
        .sort((a, b) => a.row - b.row),
    };
  } catch (err) {
    console.error("importResidents failed", err);
    return {
      success: false,
      written: 0,
      failed: [],
      error: "Import failed. Nothing was saved.",
    };
  }
}

const getHostelStudentSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  rollNo: z.string(),
  gender: genderSchema.optional(),
  cgpi: z.number(),
});

// Open: exported and unauthenticated because the sign-up hook in src/auth calls it before a session exists.
export async function getHostelStudent(
  payload: z.infer<typeof getHostelStudentSchema>
): Promise<HostelStudentJson | null> {
  const response = getHostelStudentSchema.safeParse(payload);
  if (!response.success) {
    return Promise.reject("Invalid schema has passed");
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
      return serialize(hostel);
    }
    return serialize(hostelStudent);
  } catch (err) {
    console.error("Failed to fetch student", err);
    return null;
  }
}
