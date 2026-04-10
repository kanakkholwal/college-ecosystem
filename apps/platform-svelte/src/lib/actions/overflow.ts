import type { Action } from 'svelte/action';

/**
 * Svelte action that detects when an element's content overflows its container.
 * Dispatches `overflow` events with `{ detail: boolean }` indicating overflow state.
 *
 * Usage:
 * ```svelte
 * <div use:overflow onoverflow={(e) => hasOverflow = e.detail}>...</div>
 * ```
 */
export const overflow: Action<
	HTMLElement,
	undefined,
	{ onoverflow: (e: CustomEvent<boolean>) => void }
> = (node) => {
	let current = false;

	const check = () => {
		const isOverflowing =
			node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight;
		if (isOverflowing !== current) {
			current = isOverflowing;
			node.dispatchEvent(new CustomEvent('overflow', { detail: isOverflowing }));
		}
	};

	check();

	const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
	ro?.observe(node);

	return {
		destroy() {
			ro?.disconnect();
		}
	};
};
