import dbConnect from '$lib/server/db/mongo';
import Timetable, { type TimeTableWithID } from '$lib/server/models/time-table';
import type { SessionUser } from '$lib/server/auth';
import type { RawTimetableType as RawTimetable } from '$lib/constants/common.time-table';

export async function getTimeTable(
	department_code: string,
	year: number,
	semester: number
): Promise<TimeTableWithID | null> {
	try {
		await dbConnect();
		const timetable = await Timetable.findOne({
			department_code,
			year,
			semester
		}).exec();
		if (!timetable) return null;
		return JSON.parse(JSON.stringify(timetable));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch timetable');
	}
}

export async function getAllTimeTables(): Promise<Partial<TimeTableWithID>[]> {
	try {
		await dbConnect();
		const timetables = await Timetable.find({})
			.select('department_code sectionName year semester author updatedAt')
			.sort({ department_code: 1, year: 1, semester: 1 })
			.exec();
		return JSON.parse(JSON.stringify(timetables));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch timetables');
	}
}

export async function createTimeTable(timetableData: RawTimetable, user: SessionUser) {
	try {
		if (user.other_roles.includes('student') && user.other_roles.length === 1) {
			throw new Error("Student can't create a timetable");
		}
		if (
			!timetableData.department_code ||
			!timetableData.sectionName ||
			!timetableData.year ||
			!timetableData.semester ||
			!timetableData.schedule
		) {
			throw new Error('Invalid timetable data');
		}
		await dbConnect();

		const existingTimetable = await Timetable.findOne({
			department_code: timetableData.department_code,
			sectionName: timetableData.sectionName,
			year: timetableData.year,
			semester: timetableData.semester
		});
		if (existingTimetable) throw new Error('Timetable already exists');

		const newTimetable = new Timetable({
			...timetableData,
			author: user.id
		});
		await newTimetable.save();
		return 'Timetable created successfully';
	} catch (err) {
		console.error(err);
		throw err instanceof Error ? err : new Error('Failed to create timetable');
	}
}
