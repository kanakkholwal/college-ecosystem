"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession, isAdminLike } from "~/auth/guards";
import type { rawEventsSchemaType } from "~/constants/common.events";
import { newEventSchema, rawEventsSchema } from "~/constants/common.events";
import { isObjectIdString } from "~/constants/hostel_n_outpass";
import {
  type ActionResult,
  runAction,
  UserFacingError,
} from "~/lib/action-result";
import dbConnect from "~/lib/dbConnect";
import { type EventJSONType, EventModel } from "~/models/events";
import { serialize } from "~/utils/serialize";

const NOT_ADMIN = "Only admins can change events";
const NOT_FOUND = "Event not found or already deleted";

async function requireAdmin() {
  const session = await getCurrentSession();
  if (!isAdminLike(session?.user)) throw new UserFacingError(NOT_ADMIN);
}

function revalidateEvents() {
  revalidatePath("/academic-calendar");
  revalidatePath("/[moderator]/events", "layout");
}

export async function createNewEvent(
  newEvent: rawEventsSchemaType
): Promise<ActionResult<EventJSONType>> {
  return runAction("The event couldn't be saved. Try again.", async () => {
    await requireAdmin();
    const validatedEvent = newEventSchema.safeParse(newEvent);
    if (!validatedEvent.success) {
      throw new UserFacingError(validatedEvent.error.issues[0].message);
    }
    await dbConnect();
    const event = await EventModel.create(validatedEvent.data);
    revalidateEvents();
    return serialize<EventJSONType>({
      ...event.toObject(),
      id: event._id.toString(),
    });
  });
}

export async function saveNewEvents(
  newEvents: rawEventsSchemaType[]
): Promise<ActionResult<EventJSONType[]>> {
  return runAction("The events couldn't be saved. Try again.", async () => {
    await requireAdmin();
    const validatedEvents = rawEventsSchema.array().safeParse(newEvents);
    if (!validatedEvents.success) {
      throw new UserFacingError(validatedEvents.error.issues[0].message);
    }
    await dbConnect();
    const events = await EventModel.insertMany(validatedEvents.data);
    revalidateEvents();
    // Spreading a hydrated document copies Mongoose internals, not its fields.
    return serialize<EventJSONType[]>(
      events.map((event) => ({
        ...event.toObject(),
        id: event._id.toString(),
      }))
    );
  });
}

interface GroupedEvents {
  day: Date;
  events: EventJSONType[];
}

export async function getEvents({
  query = "",
  from = new Date(0), // Default to epoch start if no from date is provided
  to = new Date(), // Default to current date if no to date is provided
}: {
  query?: string;
  from?: Date | string;
  to?: Date | string;
}): Promise<GroupedEvents[]> {
  try {
    await dbConnect();
    // Build the aggregation pipeline
    const pipeline: any[] = [];

    // Match stage for search and time filters
    const matchStage: any = {};

    // Text search
    if (query) {
      // The query comes from a public URL; escape it so it can't be an expensive or invalid regex.
      const pattern = query
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      matchStage.$or = [
        { title: { $regex: pattern, $options: "i" } },
        { description: { $regex: pattern, $options: "i" } },
      ];
    }

    // Overlap: the event starts before the range ends and ends (or, without an end, starts) after it begins.
    const timeConditions: any[] = [];
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (fromDate && !Number.isNaN(fromDate.getTime())) {
      timeConditions.push({
        $or: [{ time: { $gte: fromDate } }, { endDate: { $gte: fromDate } }],
      });
    }

    if (toDate && !Number.isNaN(toDate.getTime())) {
      timeConditions.push({ time: { $lte: toDate } });
    }

    if (timeConditions.length > 0) {
      matchStage.$and = timeConditions;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Add grouping by day
    // Add grouping and projection
    pipeline.push(
      // {
      //   $addFields: {
      //     dayStart: {
      //       $dateFromParts: {
      //         year: { $year: "$time" },
      //         month: { $month: "$time" },
      //         day: { $dayOfMonth: "$time" },
      //       },
      //     },
      //   },
      // },
      {
        $addFields: {
          localDayStart: {
            $dateFromParts: {
              year: { $year: { date: "$time", timezone: "Asia/Kolkata" } },
              month: { $month: { date: "$time", timezone: "Asia/Kolkata" } },
              day: { $dayOfMonth: { date: "$time", timezone: "Asia/Kolkata" } },
              timezone: "Asia/Kolkata",
            },
          },
        },
      },
      {
        $group: {
          _id: "$localDayStart",
          events: {
            $push: {
              $mergeObjects: ["$$ROOT", { id: "$_id" }, { _id: "$$REMOVE" }],
            },
          },
        },
      },
      {
        $project: {
          day: "$_id",
          events: 1,
          _id: 0,
        },
      },
      { $sort: { day: 1 } }
    );

    // Execute aggregation
    const result = await EventModel.aggregate<GroupedEvents>(pipeline);

    return serialize<GroupedEvents[]>(result);
  } catch (err) {
    console.error("getEvents failed", err);
    throw err;
  }
}

export async function getEventById(
  eventId: string
): Promise<EventJSONType | null> {
  if (!isObjectIdString(eventId)) return null;
  try {
    await dbConnect();
    const event = await EventModel.findById(eventId);
    if (!event) return null;
    return serialize<EventJSONType>({
      ...event.toObject(),
      id: event._id.toString(),
    });
  } catch (err) {
    console.error("getEventById failed", err);
    throw err;
  }
}

export async function updateEvent(
  eventId: string,
  updatedData: rawEventsSchemaType
): Promise<ActionResult<EventJSONType>> {
  return runAction("The event couldn't be saved. Try again.", async () => {
    await requireAdmin();
    const validatedEvent = rawEventsSchema.safeParse(updatedData);
    if (!validatedEvent.success) {
      throw new UserFacingError(validatedEvent.error.issues[0].message);
    }
    if (!isObjectIdString(eventId)) throw new UserFacingError(NOT_FOUND);
    await dbConnect();
    const { data } = validatedEvent;
    // An undefined key is skipped by $set, so a cleared end date or location would survive.
    const result = await EventModel.findByIdAndUpdate(
      eventId,
      { ...data, endDate: data.endDate ?? null, location: data.location ?? "" },
      { new: true }
    );
    if (!result) throw new UserFacingError(NOT_FOUND);
    revalidateEvents();
    return serialize<EventJSONType>({
      ...result.toObject(),
      id: result._id.toString(),
    });
  });
}

export async function deleteEvent(
  eventId: string
): Promise<ActionResult<string>> {
  return runAction("The event couldn't be deleted. Try again.", async () => {
    await requireAdmin();
    if (!isObjectIdString(eventId)) throw new UserFacingError(NOT_FOUND);
    await dbConnect();
    const result = await EventModel.deleteOne({ _id: eventId });
    if (result.deletedCount === 0) throw new UserFacingError(NOT_FOUND);
    revalidateEvents();
    return "Event deleted successfully";
  });
}
