import { isValidRollNumber } from '$lib/constants/common.result';
import dbConnect from '$lib/server/db/mongo';
import ResultModel, { type IResultType, type ResultTypeWithId } from '$lib/server/models/result';

export const getResultByRollNo = async (
	rollNo: string
): Promise<{
	message: string;
	error: unknown;
	data: ResultTypeWithId | null;
}> => {
	if (!isValidRollNumber(rollNo)) {
		return {
			message: 'Invalid roll number',
			error: 'INVALID_ROLL_NUMBER',
			data: null
		};
	}
	try {
		await dbConnect();
		const resultData = await ResultModel.findOne<IResultType>({ rollNo });
		if (!resultData) {
			return {
				message: 'Result not found',
				error: 'RESULT_NOT_FOUND',
				data: null
			};
		}
		return {
			data: JSON.parse(JSON.stringify(resultData)),
			message: 'Result found',
			error: false
		};
	} catch (err) {
		console.error('ERROR:[getResult]:', err);
		return {
			message: 'An error occurred',
			error: err,
			data: null
		};
	}
};
