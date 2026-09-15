import type mongoose from "mongoose";
import { headers } from "next/headers";
import { cache } from "react";
import { auth, type Session } from "~/auth";
import { ROLES_ENUMS } from "~/constants";
import { isObjectIdString } from "~/constants/hostel_n_outpass";
import dbConnect from "~/lib/dbConnect";
import {
  HostelModel,
  HostelStudentModel,
  type RawHostelType,
} from "~/models/hostel_n_outpass";

// Server-only helpers: never mark this module "use server", or every export becomes a public endpoint.

export type HostelUser = Session["user"];

export type HostelLean = RawHostelType & { _id: mongoose.Types.ObjectId };

export type HostelerLean = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  rollNumber: string;
  roomNumber: string;
  gender: string;
  cgpi?: number;
  banned: boolean;
  bannedTill?: Date;
  hostelId: mongoose.Types.ObjectId | null;
};

export type AccessDenied = {
  ok: false;
  status: 401 | 403 | 404;
  error: string;
};

export const CAMPUS_WIDE_ROLES: string[] = [
  ROLES_ENUMS.ADMIN,
  ROLES_ENUMS.CHIEF_WARDEN,
];
export const HOSTEL_STAFF_ROLES: string[] = [
  ROLES_ENUMS.WARDEN,
  ROLES_ENUMS.ASSISTANT_WARDEN,
  ROLES_ENUMS.MMCA,
];

const HOSTEL_FIELDS = "_id name slug gender warden administrators";

export const getHostelSession = cache(async (): Promise<Session | null> => {
  try {
    return (await auth.api.getSession({
      headers: await headers(),
    })) as Session | null;
  } catch {
    return null;
  }
});

export function hasRole(user: HostelUser, roles: readonly string[]) {
  return (
    roles.includes(user.role) ||
    (user.other_roles ?? []).some((role) => roles.includes(role))
  );
}

export const isCampusWide = (user: HostelUser) =>
  hasRole(user, CAMPUS_WIDE_ROLES);

const primaryEmails = (user: HostelUser) => {
  const email = user.email.trim();
  return [...new Set([email, email.toLowerCase()])];
};

/** Staff link to a hostel by account id or primary email only; `other_emails` is user-editable. */
export function isListedStaff(
  user: HostelUser,
  hostel: Pick<RawHostelType, "warden" | "administrators">
) {
  const email = user.email.trim().toLowerCase();
  const matches = (person?: { email?: string; userId?: string | null }) =>
    !!person &&
    ((!!person.userId && person.userId === user.id) ||
      person.email?.trim().toLowerCase() === email);
  return matches(hostel.warden) || (hostel.administrators ?? []).some(matches);
}

const staffFilter = (user: HostelUser) => {
  const emails = primaryEmails(user);
  return {
    $or: [
      { "warden.userId": user.id },
      { "warden.email": { $in: emails } },
      { "administrators.userId": user.id },
      { "administrators.email": { $in: emails } },
    ],
  };
};

/** The hostel this staff member runs, found from verified identity. */
export async function findStaffHostel(user: HostelUser) {
  if (!hasRole(user, [...HOSTEL_STAFF_ROLES, ...CAMPUS_WIDE_ROLES])) {
    return null;
  }
  await dbConnect();
  return HostelModel.findOne(staffFilter(user))
    .select(HOSTEL_FIELDS)
    .lean<HostelLean>();
}

async function findHostel(ref: string, by: "slug" | "id") {
  if (by === "id" && !isObjectIdString(ref)) return null;
  await dbConnect();
  const filter = by === "slug" ? { slug: ref } : { _id: ref };
  return HostelModel.findOne(filter).select(HOSTEL_FIELDS).lean<HostelLean>();
}

export type ManagerAccess = {
  ok: true;
  session: Session;
  hostel: HostelLean;
  scope: "campus" | "staff";
};

/** Admin or chief warden for any hostel; warden, assistant warden or MMCA only for the hostel that lists them. */
export const authorizeHostelManager = cache(
  async (
    ref: string,
    by: "slug" | "id" = "slug"
  ): Promise<ManagerAccess | AccessDenied> => {
    const session = await getHostelSession();
    if (!session?.user) {
      return { ok: false, status: 401, error: "Sign in to continue" };
    }
    const hostel = await findHostel(ref, by);
    if (!hostel) return { ok: false, status: 404, error: "Hostel not found" };

    if (isCampusWide(session.user)) {
      return { ok: true, session, hostel, scope: "campus" };
    }
    if (
      hasRole(session.user, HOSTEL_STAFF_ROLES) &&
      isListedStaff(session.user, hostel)
    ) {
      return { ok: true, session, hostel, scope: "staff" };
    }
    return {
      ok: false,
      status: 403,
      error: "You don't manage this hostel",
    };
  }
);

export type ResidentAccess = {
  ok: true;
  session: Session;
  hosteler: HostelerLean;
  hostel: HostelLean;
};

/** The signed-in student's own hostel record, matched by primary email. */
export const authorizeResident = cache(
  async (): Promise<ResidentAccess | AccessDenied> => {
    const session = await getHostelSession();
    if (!session?.user) {
      return { ok: false, status: 401, error: "Sign in to continue" };
    }
    await dbConnect();
    const hosteler = await HostelStudentModel.findOne({
      email: { $in: primaryEmails(session.user) },
    })
      .select(
        "_id name email rollNumber roomNumber gender cgpi banned bannedTill hostelId"
      )
      .lean<HostelerLean>();
    if (!hosteler?.hostelId) {
      return {
        ok: false,
        status: 404,
        error: "You don't have a hostel assigned yet",
      };
    }
    const hostel = await findHostel(hosteler.hostelId.toString(), "id");
    if (!hostel) {
      return { ok: false, status: 404, error: "Your hostel was not found" };
    }
    return { ok: true, session, hosteler, hostel };
  }
);

/** Gate staff and admins: the only roles that may log exits and returns. */
export const authorizeGate = cache(
  async (): Promise<{ ok: true; session: Session } | AccessDenied> => {
    const session = await getHostelSession();
    if (!session?.user) {
      return { ok: false, status: 401, error: "Sign in to continue" };
    }
    if (!hasRole(session.user, [ROLES_ENUMS.GUARD, ROLES_ENUMS.ADMIN])) {
      return {
        ok: false,
        status: 403,
        error: "Only gate staff can log exits and returns",
      };
    }
    return { ok: true, session };
  }
);
