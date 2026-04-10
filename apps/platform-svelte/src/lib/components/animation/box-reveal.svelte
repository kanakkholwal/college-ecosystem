<script lang="ts">
	import type { Snippet } from 'svelte';
	import { inview } from '$lib/actions/inview';
	import { cn } from '$lib/utils';

	let {
		children,
		class: className = '',
		boxColor = 'hsl(var(--primary))',
		duration = 0.5
	}: {
		children: Snippet;
		class?: string;
		boxColor?: string;
		duration?: number;
	} = $props();

	let visible = $state(false);
</script>

<div
	use:inview={{ once: true, threshold: 0.3 }}
	oninview={() => (visible = true)}
	class={cn('box-reveal', visible && 'is-visible', className)}
	style="--box-color: {boxColor}; --reveal-duration: {duration}s"
>
	<div class="box-reveal-content">
		{@render children()}
	</div>
	<span class="box-reveal-overlay"></span>
</div>

<style>
	.box-reveal {
		position: relative;
		display: inline-flex;
		overflow: hidden;
		width: fit-content;
	}
	.box-reveal-content {
		opacity: 0;
		transform: translateY(28px);
		transition:
			opacity var(--reveal-duration) cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-duration),
			transform var(--reveal-duration) cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-duration);
	}
	.box-reveal.is-visible .box-reveal-content {
		opacity: 1;
		transform: translateY(0);
	}
	.box-reveal-overlay {
		position: absolute;
		inset: 0;
		background: var(--box-color);
		transform: translateX(-101%);
	}
	.box-reveal.is-visible .box-reveal-overlay {
		animation: box-reveal-sweep var(--reveal-duration) cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	@keyframes box-reveal-sweep {
		0% {
			transform: translateX(-101%);
		}
		50% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(101%);
		}
	}
</style>
