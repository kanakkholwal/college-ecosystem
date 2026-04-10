import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { messages }: { messages: UIMessage[] } = await request.json();

	const result = streamText({
		model: google('gemini-2.0-flash-exp'),
		messages: convertToModelMessages(messages),
		system:
			'You are a helpful assistant for NITH students. Answer questions about courses, results, hostels, academic calendar, and campus life concisely and politely.'
	});

	return result.toUIMessageStreamResponse();
};
