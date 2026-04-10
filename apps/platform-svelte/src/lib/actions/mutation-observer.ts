import type { Action } from 'svelte/action';

/**
 * Svelte action wrapping MutationObserver. Dispatches `mutation` events when the node changes.
 *
 * Usage:
 * ```svelte
 * <div use:mutationObserver={{ childList: true }} onmutation={(e) => console.log(e.detail)}>
 *   ...
 * </div>
 * ```
 */
export const mutationObserver: Action<
	HTMLElement,
	MutationObserverInit | undefined,
	{ onmutation: (e: CustomEvent<MutationRecord[]>) => void }
> = (node, options = { childList: true, subtree: true, attributes: true }) => {
	if (typeof MutationObserver === 'undefined') {
		return { destroy() {} };
	}

	const observer = new MutationObserver((mutations) => {
		node.dispatchEvent(new CustomEvent('mutation', { detail: mutations }));
	});

	observer.observe(node, options);

	return {
		update(newOptions: MutationObserverInit | undefined) {
			observer.disconnect();
			observer.observe(node, newOptions ?? options);
		},
		destroy() {
			observer.disconnect();
		}
	};
};
