import { browser } from '$app/environment';

/**
 * Create a reactive media query matcher. Replaces React's `useMediaQuery`.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { createMediaQuery } from '$lib/stores/media-query.svelte';
 *   const lg = createMediaQuery('(min-width: 1024px)');
 * </script>
 * {#if lg.current}...{/if}
 * ```
 */
export function createMediaQuery(query: string) {
	let matches = $state(false);
	let mql: MediaQueryList | undefined;
	let listener: ((e: MediaQueryListEvent) => void) | undefined;

	if (browser) {
		mql = window.matchMedia(query);
		matches = mql.matches;
		listener = (e) => {
			matches = e.matches;
		};
		mql.addEventListener('change', listener);
	}

	return {
		get current() {
			return matches;
		},
		destroy() {
			if (mql && listener) mql.removeEventListener('change', listener);
		}
	};
}
