import { inArray } from 'drizzle-orm';
import { z } from 'zod';
import type { SessionUser } from '$lib/server/auth';
import type { RawCommunityPostType } from '$lib/constants/common.community';
import { db } from '$lib/server/db/connect';
import { users } from '$lib/server/db/schema';
import dbConnect from '$lib/server/db/mongo';
import CommunityPost, {
	CommunityComment,
	type CommunityPostTypeWithId,
	type ICommunityPost,
	rawCommunityCommentSchema
} from '$lib/server/models/community';

/**
 * Create a new community post.
 * Caller (SvelteKit form action) must pass the authenticated user.
 */
export async function createPost(postData: RawCommunityPostType, user: SessionUser) {
	try {
		await dbConnect();
		const post = new CommunityPost({
			...postData,
			author: {
				id: user.id,
				name: user.name,
				username: user.username
			},
			views: 0,
			likes: [],
			savedBy: []
		});
		await post.save();
		return 'Post created successfully';
	} catch (err) {
		console.error(err);
		throw new Error('Failed to create post');
	}
}

export async function getPostsByCategory(
	category: string,
	page: number,
	limit: number
): Promise<CommunityPostTypeWithId[]> {
	try {
		await dbConnect();
		const posts = await CommunityPost.find({
			category: category === 'all' ? { $exists: true } : category
		})
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.populate('author', 'name email rollNo');
		return JSON.parse(JSON.stringify(posts));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch posts');
	}
}

export async function getPostById(
	id: string,
	cached: boolean
): Promise<CommunityPostTypeWithId | null> {
	try {
		await dbConnect();
		const postExists = await CommunityPost.findById(id);
		if (!postExists) return null;

		const post = await CommunityPost.findById(id).populate('author', 'name email rollNo');
		if (!cached && post) {
			post.views += 1;
			await post.save();
		}
		return JSON.parse(JSON.stringify(post));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch post');
	}
}

type UpdateAction =
	| { type: 'toggleLike' }
	| { type: 'toggleSave' }
	| { type: 'incrementViews' }
	| {
			type: 'edit';
			data: Partial<Pick<CommunityPostTypeWithId, 'title' | 'content'>>;
	  };

export async function updatePost(id: string, action: UpdateAction, user: SessionUser) {
	await dbConnect();

	const post = await CommunityPost.findById(id);
	if (!post) throw new Error('Post not found');

	switch (action.type) {
		case 'toggleLike': {
			const idx = post.likes.indexOf(user.id);
			if (idx === -1) post.likes.push(user.id);
			else post.likes.splice(idx, 1);
			break;
		}
		case 'toggleSave': {
			const idx = post.savedBy.indexOf(user.id);
			if (idx === -1) post.savedBy.push(user.id);
			else post.savedBy.splice(idx, 1);
			break;
		}
		case 'incrementViews': {
			post.views += 1;
			break;
		}
		case 'edit': {
			if (post.author.id !== user.id && user.role !== 'admin') {
				throw new Error('You are not authorized to edit this post');
			}
			Object.assign(post, action.data);
			break;
		}
		default:
			throw new Error('Unknown update action');
	}

	await post.save();
	return JSON.parse(JSON.stringify(post)) as CommunityPostTypeWithId;
}

export async function deletePost(id: string, user: SessionUser) {
	try {
		await dbConnect();
		const post = await CommunityPost.findById(id);
		if (!post) throw new Error('Post not found');

		if (post.author.id !== user.id && user.role !== 'admin') {
			throw new Error('You are not authorized to delete this post');
		}
		await post.deleteOne();
		await CommunityComment.deleteMany({ postId: id });
		return 'Post deleted successfully';
	} catch (err) {
		console.error(err);
		throw new Error('Failed to delete post');
	}
}

export async function getPostActivity(id: string) {
	try {
		await dbConnect();
		const post = await CommunityPost.findById<ICommunityPost>(id);
		if (!post) throw new Error('Post not found');

		const likedBy =
			post.likes.length === 0
				? []
				: await db
						.select({
							id: users.id,
							name: users.name,
							username: users.username,
							image: users.image
						})
						.from(users)
						.where(inArray(users.id, post.likes));

		const savedBy =
			post.savedBy.length === 0
				? []
				: await db
						.select({
							id: users.id,
							name: users.name,
							username: users.username,
							image: users.image
						})
						.from(users)
						.where(inArray(users.id, post.savedBy));

		return { likedBy, savedBy };
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch post stats');
	}
}

export async function createComment(
	commentData: z.infer<typeof rawCommunityCommentSchema>,
	user: SessionUser
) {
	try {
		await dbConnect();
		const comment = new CommunityComment({
			...commentData,
			author: user.id
		});
		await comment.save();
		return 'Comment created successfully';
	} catch (err) {
		console.error(err);
		throw new Error('Failed to create comment');
	}
}

export async function getCommentsForPost(postId: string, page: number, limit: number) {
	try {
		await dbConnect();
		const comments = await CommunityComment.find({ postId })
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.populate('replies')
			.populate('author', 'name email');
		return JSON.parse(JSON.stringify(comments));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch comments');
	}
}
