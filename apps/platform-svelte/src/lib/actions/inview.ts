import type { Action } from 'svelte/action';

export type InviewOptions = {
	threshold?: number;
	rootMargin?: string;
	once?: boolean;
};

/**
 * Svelte action that uses IntersectionObserver to dispatch `inview` and `outview`
 * custom events when the node enters/leaves the viewport.
 *
 * Replaces framer-motion's `useInView` hook.
 *
 * Usage:
 * ```svelte
 * <div use:inview={{ once: true }} oninview={() => visible = true}>
 *   ...
 * </div>
 * ```
 */
export const inview: Action<
	HTMLElement,
	InviewOptions | undefined,
	{
		oninview: (e: CustomEvent<IntersectionObserverEntry>) => void;
		onoutview: (e: CustomEvent<IntersectionObserverEntry>) => void;
	}
> = (node, options = {}) => {
	const { threshold = 0.2, rootMargin = '0px', once = true } = options;

	if (typeof IntersectionObserver === 'undefined') {
		// SSR / unsupported: dispatch inview immediately so content shows
		queueMicrotask(() => {
			node.dispatchEvent(new CustomEvent('inview'));
		});
		return { destroy() {} };
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.dispatchEvent(new CustomEvent('inview', { detail: entry }));
					if (once) observer.unobserve(node);
				} else {
					node.dispatchEvent(new CustomEvent('outview', { detail: entry }));
				}
			}
		},
		{ threshold, rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
