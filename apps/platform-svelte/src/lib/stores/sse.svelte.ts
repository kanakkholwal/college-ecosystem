import { browser } from '$app/environment';
import { EventSource } from 'eventsource';

/**
 * Reactive Server-Sent Events state. Replaces React's `useSSE` hook.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { createSSE } from '$lib/stores/sse.svelte';
 *   const feed = createSSE<Post>('/api/feed');
 * </script>
 * {#if feed.error}...{/if}
 * {feed.data}
 * ```
 */
export function createSSE<Data>(url: string, init?: EventSourceInit) {
	let data = $state<Data | null>(null);
	let error = $state<string | null>(null);
	let source: EventSource | null = null;

	if (browser) {
		if (!url) {
			error = 'URL is required for SSE connection';
			console.error('SSE Error: URL is required');
		} else {
			source = new EventSource(url, init);
			source.onmessage = (event) => {
				try {
					data = JSON.parse(event.data);
				} catch (e) {
					console.error('[createSSE] JSON parse error:', e);
				}
			};
			source.onerror = () => {
				error = 'Connection lost. Trying to reconnect...';
				source?.close();
			};
		}
	}

	return {
		get data() {
			return data;
		},
		get error() {
			return error;
		},
		get source() {
			return source;
		},
		close() {
			source?.close();
			source = null;
		}
	};
}
