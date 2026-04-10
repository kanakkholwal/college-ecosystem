import { browser } from '$app/environment';

const MOBILE_BREAKPOINT = 768;

/**
 * Reactive mobile state. Returns `true` when viewport width is below the mobile breakpoint.
 * Replaces React's `useIsMobile` hook.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { mobile } from '$lib/stores/mobile.svelte';
 * </script>
 * {#if mobile.current}...{/if}
 * ```
 */
class MobileState {
	#value = $state(false);

	constructor() {
		if (!browser) return;
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		this.#value = mql.matches;
		const onChange = (e: MediaQueryListEvent) => {
			this.#value = e.matches;
		};
		mql.addEventListener('change', onChange);
	}

	get current() {
		return this.#value;
	}
}

export const mobile = new MobileState();
