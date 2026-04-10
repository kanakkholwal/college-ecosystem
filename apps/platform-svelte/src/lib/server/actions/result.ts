import { z } from 'zod';
import type { PipelineStage } from 'mongoose';
import dbConnect from '$lib/server/db/mongo';
import { serverFetch } from '$lib/server/fetch';
import redis from '$lib/server/redis';
import ResultModel, { type ResultTypeWithId } from '$lib/server/models/result';

type responseResultType = Omit<ResultTypeWithId, 'semesters'> & {
	cgpi: number;
	prevCgpi?: number;
};

type getResultsReturnType = {
	results: responseResultType[];
	totalPages: number;
	totalCount: number;
};

function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getResults(
	query: string,
	currentPage: number,
	filter: {
		branch?: string;
		programme?: string;
		batch?: string;
		limit?: number;
		include_freshers?: boolean;
	},
	new_cache?: boolean
): Promise<getResultsReturnType> {
	try {
		const resultsPerPage = Math.max(1, filter?.limit || 32);
		const page = Math.max(1, Number(currentPage) || 1);

		let normalizedBatch: number | null = null;
		if (filter.batch && filter.batch !== 'all') {
			const parsed = Number.parseInt(filter.batch.trim(), 10);
			if (!Number.isNaN(parsed)) normalizedBatch = parsed;
		}

		const keyParts = [
			`q=${encodeURIComponent(query || '')}`,
			`p=${page}`,
			`l=${resultsPerPage}`,
			`b=${filter?.branch ?? 'all'}`,
			`pr=${filter?.programme ?? 'all'}`,
			`bt=${normalizedBatch ?? 'all'}`,
			`f=${filter?.include_freshers ? '1' : '0'}`
		];
		const cacheKey = `results:${keyParts.join('|')}`;

		if (!new_cache) {
			try {
				const cached = await redis?.get(cacheKey);
				if (cached) return JSON.parse(cached) as getResultsReturnType;
			} catch (e) {
				console.log('Redis GET error:', e);
			}
		} else {
			try {
				await redis?.del(cacheKey);
			} catch (e) {
				console.log('Redis DEL error:', e);
			}
		}

		await dbConnect();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const filterQuery: any = {};

		if (query && query.trim() !== '') {
			const tokens = query.trim().split(/\s+/).filter(Boolean);
			filterQuery.$and = tokens.map((token) => {
				const safe = escapeRegExp(token);
				const regex = { $regex: safe, $options: 'i' };
				return { $or: [{ name: regex }, { rollNo: regex }] };
			});
		}

		if (filter.include_freshers === false) {
			filterQuery['semesters.0'] = { $exists: true };
		}
		if (filter.branch && filter.branch !== 'all') filterQuery.branch = filter.branch;
		if (filter.programme && filter.programme !== 'all') filterQuery.programme = filter.programme;
		if (normalizedBatch !== null) filterQuery.batch = normalizedBatch;

		const skip = (page - 1) * resultsPerPage;

		const aggregationPipeline: PipelineStage[] = [
			{ $match: filterQuery },
			{ $sort: { 'rank.college': 1 } },
			{ $skip: skip },
			{ $limit: resultsPerPage },
			{
				$addFields: {
					semestersCount: { $size: '$semesters' },
					lastSemester: { $last: '$semesters' }
				}
			},
			{
				$addFields: {
					cgpi: { $cond: [{ $gte: ['$semestersCount', 1] }, '$lastSemester.cgpi', null] },
					prevCgpi: {
						$cond: [
							{ $gte: ['$semestersCount', 2] },
							{ $arrayElemAt: ['$semesters', { $subtract: ['$semestersCount', 2] }] },
							null
						]
					}
				}
			},
			{ $addFields: { prevCgpi: '$prevCgpi.cgpi' } },
			{ $project: { semesters: 0, lastSemester: 0, secondLastSemester: 0 } }
		];

		const [results, totalCount] = await Promise.all([
			ResultModel.aggregate(aggregationPipeline),
			ResultModel.countDocuments(filterQuery)
		]);

		const totalPages = Math.max(1, Math.ceil(totalCount / resultsPerPage));
		const response = { results, totalPages, totalCount };

		try {
			await redis?.set(cacheKey, JSON.stringify(response), 'EX', 60 * 60 * 24);
		} catch (e) {
			console.log('Redis SET error:', e);
		}

		return response;
	} catch (err) {
		console.error('Error in getResults:', err);
		throw new Error('Failed to fetch results');
	}
}

type CachedLabels = {
	branches: string[];
	batches: string[];
	programmes: string[];
};

export async function getCachedLabels(new_cache?: boolean): Promise<CachedLabels> {
	const cacheKey = 'result:cached_labels:v1';
	if (!new_cache) {
		try {
			const cached = await redis?.get(cacheKey);
			if (cached) return JSON.parse(cached);
		} catch (e) {
			console.log('Redis GET error:', e);
		}
	} else {
		try {
			await redis?.del(cacheKey);
		} catch (e) {
			console.log('Redis DEL error:', e);
		}
	}

	try {
		await dbConnect();
		const [branches, batches, programmes] = await Promise.all([
			ResultModel.distinct('branch'),
			ResultModel.distinct('batch'),
			ResultModel.distinct('programme')
		]);

		const labels = { branches, batches, programmes };
		try {
			await redis?.set(cacheKey, JSON.stringify(labels), 'EX', 60 * 60 * 24 * 30 * 6);
		} catch (e) {
			console.log('Redis SET error:', e);
		}
		return labels;
	} catch (err) {
		console.error('Error fetching labels:', err);
		return { branches: [], batches: [], programmes: [] };
	}
}

export async function getResultByRollNo(
	rollNo: string,
	update?: boolean,
	is_new?: boolean
): Promise<ResultTypeWithId | null> {
	const cacheKey = `result:r:${rollNo}`;
	try {
		if (!is_new && !update) {
			const cached = await redis?.get(cacheKey);
			if (cached) return JSON.parse(cached) as ResultTypeWithId;
		} else {
			await redis?.del(cacheKey);
		}
	} catch (e) {
		console.log('Cache Error in getResultByRollNo:', e);
	}

	await dbConnect();
	const result = (await ResultModel.findOne({ rollNo })
		.lean()
		.exec()) as ResultTypeWithId | null;

	if (result && update) {
		const response = await serverFetch<{
			data: ResultTypeWithId | null;
			message: string;
			error: boolean;
		}>('/api/results/:rollNo', {
			method: 'PUT',
			params: { rollNo }
		});
		if (response.error || !response.data) return null;
		await assignRanks();
		try {
			await redis?.set(cacheKey, JSON.stringify(response.data), 'EX', 60);
		} catch (e) {
			console.log('Redis SET error:', e);
		}
		return response.data.data;
	}

	if (!result && is_new) {
		const response = await serverFetch<{
			data: ResultTypeWithId | null;
			message: string;
			error: boolean;
		}>('/api/results/:rollNo', {
			method: 'POST',
			params: { rollNo }
		});
		if (response.error || !response.data) return null;
		await assignRanks();
		try {
			await redis?.set(cacheKey, JSON.stringify(response.data), 'EX', 60);
		} catch (e) {
			console.log('Redis SET error:', e);
		}
		return response.data.data;
	}

	if (!result) return null;

	try {
		await redis?.set(cacheKey, JSON.stringify(result), 'EX', 60);
	} catch (e) {
		console.log('Redis SET error:', e);
	}

	return JSON.parse(JSON.stringify(result));
}

export async function assignRanks() {
	const response = await serverFetch<{
		error: boolean;
		message: string;
		data: object | null;
	}>('/api/results/assign-ranks', {
		method: 'POST'
	});
	if (!response.data || (response.data as { error: boolean })?.error) {
		return Promise.reject((response.data as { message: string })?.message);
	}
	return Promise.resolve(true);
}

const freshersDataSchema = z.array(
	z.object({
		name: z.string(),
		rollNo: z.string(),
		gender: z.enum(['male', 'female', 'not_specified'])
	})
);

export async function bulkUpdateGenders(data: z.infer<typeof freshersDataSchema>) {
	const parsed = freshersDataSchema.safeParse(data);
	if (!parsed.success)
		return { error: true, message: 'Invalid data', data: parsed.error };

	await dbConnect();

	const ops = parsed.data.map((s) => ({
		updateOne: {
			filter: { rollNo: s.rollNo, gender: 'not_specified' },
			update: { $set: { gender: s.gender } },
			upsert: false
		}
	}));

	const BATCH = 500;
	for (let i = 0; i < ops.length; i += BATCH) {
		const batchOps = ops.slice(i, i + BATCH);
		try {
			await ResultModel.bulkWrite(batchOps, { ordered: false });
		} catch (e) {
			console.error('bulkWrite error:', e);
		}
	}

	return { error: false, message: 'OK' };
}
