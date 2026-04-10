import dbConnect from '$lib/server/db/mongo';
import type { SessionUser } from '$lib/server/auth';
import Poll, { type PollType, type RawPollType } from '$lib/server/models/poll';

export async function createPoll(pollData: RawPollType, user: SessionUser) {
	try {
		await dbConnect();
		const poll = new Poll({
			...pollData,
			createdBy: user.username
		});
		await poll.save();
		return 'Poll created successfully';
	} catch (err) {
		console.error(err);
		throw new Error('Failed to create poll');
	}
}

export async function getOpenPolls(): Promise<PollType[]> {
	try {
		await dbConnect();
		const polls = await Poll.find({ closesAt: { $gte: new Date() } });
		return JSON.parse(JSON.stringify(polls));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch polls');
	}
}

export async function getClosedPolls(): Promise<PollType[]> {
	try {
		await dbConnect();
		const polls = await Poll.find({ closesAt: { $lt: new Date() } });
		return JSON.parse(JSON.stringify(polls));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch polls');
	}
}

export async function getAllPolls(): Promise<PollType[]> {
	try {
		await dbConnect();
		const polls = await Poll.find();
		return JSON.parse(JSON.stringify(polls));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch polls');
	}
}

export async function getPollById(id: string): Promise<PollType | null> {
	try {
		await dbConnect();
		const poll = await Poll.findById(id);
		return poll ? JSON.parse(JSON.stringify(poll)) : null;
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch poll');
	}
}

export async function voteOnPoll(
	pollId: string,
	optionId: string,
	user: SessionUser
): Promise<PollType> {
	try {
		await dbConnect();
		const poll = await Poll.findById(pollId);
		if (!poll) throw new Error('Poll not found');
		if (poll.votes.includes(user.id)) throw new Error('You have already voted on this poll');

		poll.votes.push(user.id);
		await poll.save();
		return JSON.parse(JSON.stringify(poll));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to vote on poll');
	}
}

export async function deletePoll(pollId: string): Promise<void> {
	try {
		await dbConnect();
		await Poll.findByIdAndDelete(pollId);
	} catch (err) {
		console.error(err);
		throw new Error('Failed to delete poll');
	}
}

export async function getPollsCreatedByLoggedInUser(user: SessionUser): Promise<PollType[]> {
	try {
		await dbConnect();
		const polls = await Poll.find({ createdBy: user.username });
		return JSON.parse(JSON.stringify(polls));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch polls');
	}
}
