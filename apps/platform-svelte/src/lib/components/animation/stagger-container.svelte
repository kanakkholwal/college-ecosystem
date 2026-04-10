<script lang="ts">
	import type { Snippet } from 'svelte';
	import { inview } from '$lib/actions/inview';
	import { cn } from '$lib/utils';

	let {
		children,
		class: className = '',
		staggerDelay = 0.08,
		once = true
	}: {
		children: Snippet;
		class?: string;
		staggerDelay?: number;
		once?: boolean;
	} = $props();

	let visible = $state(false);
</script>

<div
	use:inview={{ threshold: 0.1, once }}
	oninview={() => (visible = true)}
	class={cn('stagger-container', visible && 'is-visible', className)}
	style="--stagger-delay: {staggerDelay}s"
>
	{@render children()}
</div>

<style>
	.stagger-container :global(> *) {
		opacity: 0;
		transform: translateY(24px);
		transition:
			opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.stagger-container.is-visible :global(> *) {
		opacity: 1;
		transform: translateY(0);
	}
	.stagger-container.is-visible :global(> *:nth-child(1)) {
		transition-delay: calc(var(--stagger-delay) * 0);
	}
	.stagger-container.is-visible :global(> *:nth-child(2)) {
		transition-delay: calc(var(--stagger-delay) * 1);
	}
	.stagger-container.is-visible :global(> *:nth-child(3)) {
		transition-delay: calc(var(--stagger-delay) * 2);
	}
	.stagger-container.is-visible :global(> *:nth-child(4)) {
		transition-delay: calc(var(--stagger-delay) * 3);
	}
	.stagger-container.is-visible :global(> *:nth-child(5)) {
		transition-delay: calc(var(--stagger-delay) * 4);
	}
	.stagger-container.is-visible :global(> *:nth-child(6)) {
		transition-delay: calc(var(--stagger-delay) * 5);
	}
	.stagger-container.is-visible :global(> *:nth-child(7)) {
		transition-delay: calc(var(--stagger-delay) * 6);
	}
	.stagger-container.is-visible :global(> *:nth-child(8)) {
		transition-delay: calc(var(--stagger-delay) * 7);
	}
	.stagger-container.is-visible :global(> *:nth-child(9)) {
		transition-delay: calc(var(--stagger-delay) * 8);
	}
	.stagger-container.is-visible :global(> *:nth-child(n + 10)) {
		transition-delay: calc(var(--stagger-delay) * 9);
	}
</style>
