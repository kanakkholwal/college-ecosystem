import type { rawEventsSchemaType } from '$lib/constants/common.events';
import { rawEventsSchema } from '$lib/constants/common.events';
import dbConnect from '$lib/server/db/mongo';
import { EventModel, type EventJSONType } from '$lib/server/models/events';

export async function createNewEvent(newEvent: rawEventsSchemaType) {
	try {
		const validatedEvent = rawEventsSchema.safeParse(newEvent);
		if (!validatedEvent.success) {
			throw new Error(validatedEvent.error.issues[0].message);
		}
		await dbConnect();
		const event = new EventModel(newEvent);
		await event.save();
		return JSON.parse(JSON.stringify(event));
	} catch (err) {
		console.log(err);
		throw new Error(err instanceof Error ? err.message : 'Something went wrong');
	}
}

export async function saveNewEvents(
	newEvents: rawEventsSchemaType[]
): Promise<EventJSONType[]> {
	try {
		const validatedEvents = rawEventsSchema.array().safeParse(newEvents);
		if (!validatedEvents.success) {
			throw new Error(validatedEvents.error.issues[0].message);
		}
		await dbConnect();
		const events = await EventModel.insertMany(newEvents);
		return JSON.parse(
			JSON.stringify(events.map((event) => ({ ...event, id: event._id.toString() })))
		);
	} catch (err) {
		console.log(err);
		throw new Error(err instanceof Error ? err.message : 'Something went wrong');
	}
}

interface GroupedEvents {
	day: Date;
	events: EventJSONType[];
}

export async function getEvents({
	query = '',
	from = new Date(0),
	to = new Date()
}: {
	query?: string;
	from?: Date | string;
	to?: Date | string;
}): Promise<GroupedEvents[]> {
	try {
		await dbConnect();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const pipeline: any[] = [];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const matchStage: any = {};

		if (query) {
			matchStage.$or = [
				{ title: { $regex: query, $options: 'i' } },
				{ description: { $regex: query, $options: 'i' } }
			];
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const timeConditions: any[] = [];
		if (from) timeConditions.push({ time: { $gte: from } });
		if (to) {
			timeConditions.push({ time: { $lte: to } });
			timeConditions.push({
				$or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $lte: to } }]
			});
		}

		if (timeConditions.length > 0) matchStage.$and = timeConditions;
		if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });

		pipeline.push(
			{
				$addFields: {
					localDayStart: {
						$dateFromParts: {
							year: { $year: { date: '$time', timezone: 'Asia/Kolkata' } },
							month: { $month: { date: '$time', timezone: 'Asia/Kolkata' } },
							day: { $dayOfMonth: { date: '$time', timezone: 'Asia/Kolkata' } },
							timezone: 'Asia/Kolkata'
						}
					}
				}
			},
			{
				$group: {
					_id: '$localDayStart',
					events: {
						$push: {
							$mergeObjects: ['$$ROOT', { id: '$_id' }, { _id: '$$REMOVE' }]
						}
					}
				}
			},
			{ $project: { day: '$_id', events: 1, _id: 0 } },
			{ $sort: { day: 1 } }
		);

		const result = await EventModel.aggregate<GroupedEvents>(pipeline);
		return JSON.parse(JSON.stringify(result));
	} catch (err) {
		console.log(err);
		throw new Error(err instanceof Error ? err.message : 'Something went wrong');
	}
}

export async function getEventById(eventId: string): Promise<EventJSONType | null> {
	try {
		await dbConnect();
		const event = await EventModel.findById(eventId);
		if (!event) return null;
		return JSON.parse(
			JSON.stringify({
				...event.toObject(),
				id: event._id.toString()
			})
		);
	} catch (err) {
		console.log(err);
		throw new Error(err instanceof Error ? err.message : 'Something went wrong');
	}
}

export async function updateEvent(eventId: string, updatedData: rawEventsSchemaType) {
	try {
		const validatedEvent = rawEventsSchema.safeParse(updatedData);
		if (!validatedEvent.success) {
			throw new Error(validatedEvent.error.issues[0].message);
		}
		await dbConnect();
		const result = await EventModel.findByIdAndUpdate(eventId, updatedData, { new: true });
		if (!result) throw new Error('Event not found or already deleted');
		return JSON.parse(JSON.stringify(result));
	} catch (err) {
		console.log(err);
		throw new Error(err instanceof Error ? err.message : 'Something went wrong');
	}
}

export async function deleteEvent(eventId: string) {
	try {
		await dbConnect();
		const result = await EventModel.deleteOne({ _id: eventId });
		if (result.deletedCount === 0) throw new Error('Event not found or already deleted');
		return 'Event deleted successfully';
	} catch (err) {
		console.log(err);
		throw new Error(err instanceof Error ? err.message : 'Something went wrong');
	}
}
