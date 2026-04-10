<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		children,
		class: className = '',
		shimmerWidth = 100
	}: {
		children: Snippet;
		class?: string;
		shimmerWidth?: number;
	} = $props();
</script>

<span
	class={cn('animated-shiny-text', className)}
	style="--shimmer-width: {shimmerWidth}px"
>
	{@render children()}
</span>

<style>
	.animated-shiny-text {
		display: inline-block;
		background: linear-gradient(
			110deg,
			hsl(var(--muted-foreground)) 40%,
			hsl(var(--foreground)) 50%,
			hsl(var(--muted-foreground)) 60%
		);
		background-size: var(--shimmer-width) 100%;
		background-repeat: no-repeat;
		background-position: calc(var(--shimmer-width) * -1) 0;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
		animation: shiny-text 3s infinite;
	}
	@keyframes shiny-text {
		0%,
		90%,
		100% {
			background-position: calc(var(--shimmer-width) * -1) 0;
		}
		30%,
		60% {
			background-position: calc(var(--shimmer-width) * 2) 0;
		}
	}
</style>
