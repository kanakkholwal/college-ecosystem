import { cache } from "react";
import dbConnect from "~/lib/dbConnect";
import { authorizeResident } from "~/lib/hostel-access";
import { HostelStudentModel } from "~/models/hostel_n_outpass";

export type ResidentContext =
  | { ok: false; error: string }
  | {
      ok: true;
      name: string;
      rollNumber: string;
      roomNumber: string;
      hostelName: string;
      phoneNumber: string | null;
      ban: { till: string | null; reason: string | null } | null;
    };

/** The signed-in student's hostel record; the ban counts only while it is still running. */
export const getResidentContext = cache(async (): Promise<ResidentContext> => {
  const access = await authorizeResident();
  if (!access.ok) return { ok: false, error: access.error };
  const { hosteler, hostel } = access;

  await dbConnect();
  const extra = await HostelStudentModel.findById(hosteler._id)
    .select("phoneNumber bannedReason")
    .lean<{ phoneNumber?: string | null; bannedReason?: string | null }>();

  const banned =
    hosteler.banned &&
    (!hosteler.bannedTill || new Date(hosteler.bannedTill) > new Date());

  return {
    ok: true,
    name: hosteler.name,
    rollNumber: hosteler.rollNumber,
    roomNumber: hosteler.roomNumber,
    hostelName: hostel.name,
    phoneNumber: extra?.phoneNumber || null,
    ban: banned
      ? {
          till: hosteler.bannedTill
            ? new Date(hosteler.bannedTill).toISOString()
            : null,
          reason: extra?.bannedReason || null,
        }
      : null,
  };
});
