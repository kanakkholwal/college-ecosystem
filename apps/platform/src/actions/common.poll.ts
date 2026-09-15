"use server";

import { ROLES_ENUMS } from "~/constants";
import {
  type PollInput,
  pollInputSchema,
} from "@/components/application/poll/schema";
import { revalidatePath } from "next/cache";
import { getSession } from "~/auth/server";
import { isObjectIdString } from "~/constants/hostel_n_outpass";
import dbConnect from "~/lib/dbConnect";
import Poll, { type PollType } from "~/models/poll";
import { serialize } from "~/utils/serialize";

export type PollActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const fail = (error: string) => ({ ok: false, error }) as const;

export async function createPoll(
  input: PollInput
): Promise<PollActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return fail("Sign in to create a poll.");

  const parsed = pollInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Check the poll details.");
  }

  try {
    await dbConnect();
    const poll = await Poll.create({
      ...parsed.data,
      votes: [],
      createdBy: session.user.username,
    });
    revalidatePath("/polls");
    return { ok: true, data: { id: String(poll._id) } };
  } catch (err) {
    console.error(err);
    return fail("Couldn't create the poll. Try again.");
  }
}

export async function getOpenPolls(): Promise<PollType[]> {
  await dbConnect();
  const polls = await Poll.find({ closesAt: { $gt: new Date() } })
    .sort({ closesAt: 1 })
    .lean();
  return serialize(polls);
}

export async function getClosedPolls(): Promise<PollType[]> {
  await dbConnect();
  const polls = await Poll.find({ closesAt: { $lte: new Date() } })
    .sort({ closesAt: -1 })
    .lean();
  return serialize(polls);
}

export async function getPollById(id: string): Promise<PollType | null> {
  if (!isObjectIdString(id)) return null;
  await dbConnect();
  const poll = await Poll.findById(id).lean();
  return poll ? serialize(poll) : null;
}

/** One ballot per user: the filter and the push run as a single atomic update. */
export async function castVote(
  pollId: string,
  selected: string[]
): Promise<PollActionResult> {
  const session = await getSession();
  if (!session) return fail("Sign in to vote.");
  if (!isObjectIdString(pollId)) {
    return fail("This poll doesn't exist.");
  }

  const choices = Array.isArray(selected)
    ? [...new Set(selected.filter((c) => typeof c === "string"))]
    : [];
  if (choices.length === 0) return fail("Pick an option first.");

  const userId = session.user.id;
  const now = new Date();

  try {
    await dbConnect();
    const updated = await Poll.findOneAndUpdate(
      {
        _id: pollId,
        closesAt: { $gt: now },
        "votes.userId": { $ne: userId },
        options: { $all: choices },
        ...(choices.length > 1 ? { multipleChoice: true } : {}),
      },
      {
        $push: {
          votes: {
            $each: choices.map((option) => ({
              option,
              userId,
              createdAt: now,
            })),
          },
        },
      },
      { returnDocument: "after", timestamps: false, projection: { _id: 1 } }
    ).lean();

    if (!updated) {
      const poll = await Poll.findById(pollId)
        .select("closesAt votes.userId")
        .lean<Pick<PollType, "closesAt" | "votes">>();
      if (!poll) return fail("This poll doesn't exist.");
      if (new Date(poll.closesAt) <= now) return fail("This poll has closed.");
      if (poll.votes.some((v) => v.userId === userId)) {
        return fail("You've already voted on this poll.");
      }
      return fail("That choice isn't part of this poll.");
    }

    revalidatePath("/polls");
    revalidatePath(`/polls/${pollId}`);
    return { ok: true, data: null };
  } catch (err) {
    console.error(err);
    return fail("Couldn't record your vote. Try again.");
  }
}

export async function deletePoll(pollId: string): Promise<PollActionResult> {
  const session = await getSession();
  if (!session) return fail("Sign in to delete a poll.");
  if (!isObjectIdString(pollId)) {
    return fail("This poll doesn't exist.");
  }

  try {
    await dbConnect();
    const poll = await Poll.findById(pollId)
      .select("createdBy")
      .lean<Pick<PollType, "createdBy">>();
    if (!poll) return fail("This poll doesn't exist.");
    if (
      poll.createdBy !== session.user.username &&
      session.user.role !== ROLES_ENUMS.ADMIN
    ) {
      return fail("Only the author or an admin can delete this poll.");
    }
    await Poll.deleteOne({ _id: pollId });
    revalidatePath("/polls");
    return { ok: true, data: null };
  } catch (err) {
    console.error(err);
    return fail("Couldn't delete the poll. Try again.");
  }
}

export async function getPollsCreatedByLoggedInUser(): Promise<PollType[]> {
  const session = await getSession();
  if (!session) return [];
  await dbConnect();
  const polls = await Poll.find({ createdBy: session.user.username })
    .sort({ createdAt: -1 })
    .lean();
  return serialize(polls);
}
