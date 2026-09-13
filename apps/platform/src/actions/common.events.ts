"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { getSession } from "~/auth/server";
import type { rawEventsSchemaType } from "~/constants/common.events";
import { rawEventsSchema } from "~/constants/common.events";
import dbConnect from "~/lib/dbConnect";
import { type EventJSONType, EventModel } from "~/models/events";

const NOT_ADMIN = "Only admins can change events";

// Mirrors app/[moderator]/(admin)/layout.tsx, which lets both roles in.
const ADMIN_ROLES = ["admin", "moderator"];

async function isAdmin() {
  const session = await getSession();
  return !!session && ADMIN_ROLES.includes(session.user.role);
}

function revalidateEvents() {
  revalidatePath("/academic-calendar");
  revalidatePath("/[moderator]/events", "layout");
}

export async function createNewEvent(
  newEvent: rawEventsSchemaType
): Promise<EventJSONType> {
  try {
    if (!(await isAdmin())) return Promise.reject(NOT_ADMIN);
    const validatedEvent = rawEventsSchema.safeParse(newEvent);
    if (!validatedEvent.success) {
      return Promise.reject(validatedEvent.error.issues[0].message);
    }
    await dbConnect();
    const event = await EventModel.create(validatedEvent.data);
    revalidateEvents();
    return JSON.parse(
      JSON.stringify({ ...event.toObject(), id: event._id.toString() })
    );
  } catch (err) {
    console.log(err);
    return Promise.reject(
      err instanceof Error ? err.message : "Something went wrong"
    );
  }
}

export async function saveNewEvents(
  newEvents: rawEventsSchemaType[]
): Promise<EventJSONType[]> {
  try {
    if (!(await isAdmin())) return Promise.reject(NOT_ADMIN);
    const validatedEvents = rawEventsSchema.array().safeParse(newEvents);
    if (!validatedEvents.success) {
      return Promise.reject(validatedEvents.error.issues[0].message);
    }
    await dbConnect();
    const events = await EventModel.insertMany(validatedEvents.data);
    revalidateEvents();
    // Spreading a hydrated document copies Mongoose internals, not its fields.
    return JSON.parse(
      JSON.stringify(
        events.map((event) => ({
          ...event.toObject(),
          id: event._id.toString(),
        }))
      )
    );
  } catch (err) {
    console.log(err);
    return Promise.reject(
      err instanceof Error ? err.message : "Something went wrong"
    );
  }
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
      matchStage.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    // Time range filters
    const timeConditions: any[] = [];

    if (from) {
      timeConditions.push({ time: { $gte: from } });
    }

    if (to) {
      timeConditions.push({ time: { $lte: to } });
      timeConditions.push({
        $or: [
          { endDate: null },
          { endDate: { $exists: false } },
          { endDate: { $lte: to } },
        ],
      });
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

    return Promise.resolve(JSON.parse(JSON.stringify(result)));
  } catch (err) {
    console.log(err);
    return Promise.reject(
      err instanceof Error ? err.message : "Something went wrong"
    );
  }
}

export async function getEventById(
  eventId: string
): Promise<EventJSONType | null> {
  try {
    if (!isValidObjectId(eventId)) return null;
    await dbConnect();
    const event = await EventModel.findById(eventId);
    if (!event) {
      return Promise.resolve(null);
    }
    return Promise.resolve(
      JSON.parse(
        JSON.stringify({
          ...event.toObject(),
          id: event._id.toString(), // Convert _id to id
        })
      )
    );
  } catch (err) {
    console.log(err);
    return Promise.reject(
      err instanceof Error ? err.message : "Something went wrong"
    );
  }
}

export async function updateEvent(
  eventId: string,
  updatedData: rawEventsSchemaType
) {
  try {
    if (!(await isAdmin())) return Promise.reject(NOT_ADMIN);
    const validatedEvent = rawEventsSchema.safeParse(updatedData);
    if (!validatedEvent.success) {
      return Promise.reject(validatedEvent.error.issues[0].message);
    }
    if (!isValidObjectId(eventId)) {
      return Promise.reject("Event not found or already deleted");
    }
    await dbConnect();
    const { data } = validatedEvent;
    // An undefined key is skipped by $set, so a cleared end date or location would survive.
    const result = await EventModel.findByIdAndUpdate(
      eventId,
      { ...data, endDate: data.endDate ?? null, location: data.location ?? "" },
      { new: true }
    );
    if (!result) {
      return Promise.reject("Event not found or already deleted");
    }
    revalidateEvents();
    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return Promise.reject(
      err instanceof Error ? err.message : "Something went wrong"
    );
  }
}

export async function deleteEvent(eventId: string) {
  try {
    if (!(await isAdmin())) return Promise.reject(NOT_ADMIN);
    if (!isValidObjectId(eventId)) {
      return Promise.reject("Event not found or already deleted");
    }
    await dbConnect();
    const result = await EventModel.deleteOne({ _id: eventId });
    if (result.deletedCount === 0) {
      return Promise.reject("Event not found or already deleted");
    }
    revalidateEvents();
    return "Event deleted successfully";
  } catch (err) {
    console.log(err);
    return Promise.reject(
      err instanceof Error ? err.message : "Something went wrong"
    );
  }
}
