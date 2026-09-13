import { eq, or } from "drizzle-orm";
import mongoose from "mongoose";
import { cache } from "react";
import { getSession } from "~/auth/server";
import { getAcademicYear, isValidRollNumber } from "~/constants";
import { db } from "~/db/connect";
import { users } from "~/db/schema/auth-schema";
import dbConnect from "~/lib/dbConnect";
import Announcement, {
  type AnnouncementTypeWithId,
} from "~/models/announcement";
import CommunityPost, {
  type CommunityPostTypeWithId,
} from "~/models/community";
import { HostelModel } from "~/models/hostel_n_outpass";
import Poll, { type PollType } from "~/models/poll";
import ResultModel from "~/models/result";

export const PROFILE_TABS = [
  { value: "posts", label: "Posts" },
  { value: "polls", label: "Polls" },
  { value: "announcements", label: "Announcements" },
] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number]["value"];

export const PAGE_SIZE: Record<ProfileTab, number> = {
  posts: 10,
  polls: 8,
  announcements: 10,
};

const HANDLE = /^[A-Za-z0-9_.-]{1,64}$/;
const serialize = <T>(value: unknown): T => JSON.parse(JSON.stringify(value));

export function parseTab(value?: string): ProfileTab {
  return PROFILE_TABS.some((t) => t.value === value)
    ? (value as ProfileTab)
    : "posts";
}

export function parsePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? Math.min(page, 1000) : 1;
}

/** Returns null for anything that cannot be a username or legacy user id. */
export function parseHandle(raw: string) {
  let handle = raw;
  try {
    handle = decodeURIComponent(raw);
  } catch {
    return null;
  }
  return HANDLE.test(handle) ? handle : null;
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase())
    .trim();
}

/** Server-only shape: `id` is for queries and must not be passed to client components. */
export type Profile = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  department: string;
  roles: string[];
  primaryRole: string;
  joinedAt: string;
  classOf: string | null;
};

export const getProfile = cache(
  async (handle: string): Promise<Profile | null> => {
    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        image: users.image,
        department: users.department,
        roles: users.other_roles,
        createdAt: users.createdAt,
      })
      .from(users)
      // Matching the id keeps old /u/<id> links working; the page redirects them.
      .where(or(eq(users.username, handle), eq(users.id, handle)))
      .limit(1);
    if (!row) return null;
    const isStudent =
      row.roles.includes("student") && isValidRollNumber(row.username);
    return {
      id: row.id,
      name: toTitleCase(row.name),
      username: row.username,
      image: row.image,
      department: row.department,
      roles: row.roles.map(toTitleCase),
      // Same dashboard segment the profile dropdown links to.
      primaryRole: row.roles[0] ?? "student",
      joinedAt: row.createdAt.toISOString(),
      classOf: isStudent ? getAcademicYear(row.username).end : null,
    };
  }
);

export const getViewer = cache(getSession);

export type PrivateDetails = {
  email: string;
  otherEmails: string[];
  gender: string;
  hostel: string | null;
};

/** Owner and admin only: callers must check the viewer first. */
export async function getPrivateDetails(
  userId: string
): Promise<PrivateDetails | null> {
  const [row] = await db
    .select({
      email: users.email,
      otherEmails: users.other_emails,
      gender: users.gender,
      hostelId: users.hostelId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) return null;

  let hostel: string | null = null;
  if (row.hostelId && mongoose.isObjectIdOrHexString(row.hostelId)) {
    try {
      await dbConnect();
      const doc = await HostelModel.findById(row.hostelId)
        .select("name")
        .lean<{ name: string }>();
      hostel = doc?.name ?? null;
    } catch (err) {
      console.error("[profile] hostel lookup failed", err);
    }
  }
  return {
    email: row.email,
    otherEmails: row.otherEmails,
    gender: toTitleCase(row.gender.replace("not_specified", "not set")),
    hostel,
  };
}

/** Roll number as stored on the public result record, or null when there is none. */
export async function getResultRollNo(username: string) {
  if (!isValidRollNumber(username)) return null;
  try {
    await dbConnect();
    const doc = await ResultModel.findOne({
      rollNo: { $in: [username.toLowerCase(), username.toUpperCase()] },
    })
      .select("rollNo")
      .lean<{ rollNo: string }>();
    return doc?.rollNo ?? null;
  } catch (err) {
    console.error("[profile] result lookup failed", err);
    return null;
  }
}

const liveAnnouncements = (userId: string) => ({
  "createdBy.id": userId,
  // The TTL index sweeps about once a minute, so expired rows can linger.
  expiresAt: { $not: { $lte: new Date() } },
});

/** Per-tab totals; a null entry means that count could not be read. */
export async function getActivityCounts(
  profile: Profile
): Promise<Record<ProfileTab, number | null>> {
  const unknown = { posts: null, polls: null, announcements: null };
  try {
    await dbConnect();
  } catch (err) {
    console.error("[profile] activity counts failed", err);
    return unknown;
  }
  const [posts, polls, announcements] = await Promise.allSettled([
    CommunityPost.countDocuments({ "author.id": profile.id }),
    // Polls store the author's username, not their id.
    Poll.countDocuments({ createdBy: profile.username }),
    Announcement.countDocuments(liveAnnouncements(profile.id)),
  ]);
  const value = (r: PromiseSettledResult<number>) =>
    r.status === "fulfilled" ? r.value : null;
  return {
    posts: value(posts),
    polls: value(polls),
    announcements: value(announcements),
  };
}

const skip = (tab: ProfileTab, page: number) => (page - 1) * PAGE_SIZE[tab];

export async function getUserPosts(userId: string, page: number) {
  await dbConnect();
  const posts = await CommunityPost.find({ "author.id": userId })
    .sort({ createdAt: -1 })
    .skip(skip("posts", page))
    .limit(PAGE_SIZE.posts)
    .select("-content_json")
    .lean();
  return serialize<CommunityPostTypeWithId[]>(posts);
}

export async function getUserPolls(username: string, page: number) {
  await dbConnect();
  const polls = await Poll.find({ createdBy: username })
    .sort({ createdAt: -1 })
    .skip(skip("polls", page))
    .limit(PAGE_SIZE.polls)
    .lean();
  return serialize<PollType[]>(polls);
}

export async function getUserAnnouncements(userId: string, page: number) {
  await dbConnect();
  const announcements = await Announcement.find(liveAnnouncements(userId))
    .sort({ createdAt: -1 })
    .skip(skip("announcements", page))
    .limit(PAGE_SIZE.announcements)
    .select("title content relatedFor createdAt expiresAt")
    .lean();
  return serialize<
    (Pick<
      AnnouncementTypeWithId,
      "_id" | "title" | "content" | "relatedFor" | "createdAt"
    > & { expiresAt?: string })[]
  >(announcements);
}
