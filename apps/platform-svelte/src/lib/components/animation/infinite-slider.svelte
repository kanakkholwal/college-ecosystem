<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		children,
		class: className = '',
		duration = 30,
		direction = 'left',
		pauseOnHover = true
	}: {
		children: Snippet;
		class?: string;
		duration?: number;
		direction?: 'left' | 'right';
		pauseOnHover?: boolean;
	} = $props();
</script>

<div class={cn('group flex overflow-hidden', className)}>
	<div
		class={cn(
			'flex min-w-full shrink-0 gap-4 [animation-play-state:running]',
			pauseOnHover && 'group-hover:[animation-play-state:paused]',
			direction === 'left' ? 'animate-slide-left' : 'animate-slide-right'
		)}
		style="animation-duration: {duration}s"
	>
		{@render children()}
	</div>
	<div
		aria-hidden="true"
		class={cn(
			'flex min-w-full shrink-0 gap-4 [animation-play-state:running]',
			pauseOnHover && 'group-hover:[animation-play-state:paused]',
			direction === 'left' ? 'animate-slide-left' : 'animate-slide-right'
		)}
		style="animation-duration: {duration}s"
	>
		{@render children()}
	</div>
</div>

<style>
	@keyframes slide-left {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-100%);
		}
	}
	@keyframes slide-right {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}
	:global(.animate-slide-left) {
		animation: slide-left linear infinite;
	}
	:global(.animate-slide-right) {
		animation: slide-right linear infinite;
	}
</style>
