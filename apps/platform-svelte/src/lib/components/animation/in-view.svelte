<script lang="ts">
	import type { Snippet } from 'svelte';
	import { inview } from '$lib/actions/inview';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cn } from '$lib/utils';

	type Variant = 'fade' | 'fly-up' | 'fly-down' | 'fly-left' | 'fly-right';

	let {
		children,
		class: className = '',
		variant = 'fly-up',
		duration = 600,
		delay = 0,
		once = true,
		threshold = 0.2
	}: {
		children: Snippet;
		class?: string;
		variant?: Variant;
		duration?: number;
		delay?: number;
		once?: boolean;
		threshold?: number;
	} = $props();

	let visible = $state(false);

	const flyProps = $derived.by(() => {
		switch (variant) {
			case 'fly-up':
				return { y: 24, x: 0 };
			case 'fly-down':
				return { y: -24, x: 0 };
			case 'fly-left':
				return { x: 24, y: 0 };
			case 'fly-right':
				return { x: -24, y: 0 };
			default:
				return { x: 0, y: 0 };
		}
	});
</script>

<div
	use:inview={{ once, threshold }}
	oninview={() => (visible = true)}
	onoutview={() => {
		if (!once) visible = false;
	}}
	class={cn(className)}
>
	{#if visible}
		{#if variant === 'fade'}
			<div in:fade={{ duration, delay, easing: cubicOut }}>
				{@render children()}
			</div>
		{:else}
			<div in:fly={{ ...flyProps, duration, delay, easing: cubicOut }}>
				{@render children()}
			</div>
		{/if}
	{/if}
</div>
