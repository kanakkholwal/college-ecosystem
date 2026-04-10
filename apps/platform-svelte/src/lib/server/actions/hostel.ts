import { z } from 'zod';
import dbConnect from '$lib/server/db/mongo';
import { HostelStudentModel, type HostelStudentJson } from '$lib/server/models/hostel_n_outpass';

const getHostelStudentSchema = z.object({
	name: z.string(),
	email: z.string().email(),
	rollNo: z.string(),
	gender: z.enum(['male', 'female', 'not_specified']).optional(),
	cgpi: z.number()
});

export async function getHostelStudent(
	payload: z.infer<typeof getHostelStudentSchema>
): Promise<HostelStudentJson | null> {
	const response = getHostelStudentSchema.safeParse(payload);
	if (!response.success) {
		return Promise.reject('Invalid schema has passed');
	}
	const data = response.data;

	try {
		await dbConnect();
		const hostelStudent = await HostelStudentModel.findOne({
			email: data.email
		}).lean();

		if (!hostelStudent) {
			const hostel = new HostelStudentModel({
				name: data.name,
				email: data.email,
				rollNumber: data.rollNo,
				position: 'none',
				roomNumber: 'UNKNOWN',
				gender: data.gender,
				cgpi: data.cgpi,
				hostelId: null
			});
			await hostel.save();
			return JSON.parse(JSON.stringify(hostel));
		}
		return JSON.parse(JSON.stringify(hostelStudent));
	} catch (e) {
		console.error('[getHostelStudent] Error:', e);
		return null;
	}
}
