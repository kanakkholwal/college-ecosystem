<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		children,
		class: className = '',
		gradientSize = 200,
		gradientColor = 'hsl(var(--primary) / 0.15)',
		gradientOpacity = 0.8
	}: {
		children: Snippet;
		class?: string;
		gradientSize?: number;
		gradientColor?: string;
		gradientOpacity?: number;
	} = $props();

	let mouseX = $state(-gradientSize);
	let mouseY = $state(-gradientSize);

	function onMouseMove(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	}

	function onMouseLeave() {
		mouseX = -gradientSize;
		mouseY = -gradientSize;
	}
</script>

<div
	onmousemove={onMouseMove}
	onmouseleave={onMouseLeave}
	role="presentation"
	class={cn(
		'group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-colors',
		className
	)}
	style="
		--mouse-x: {mouseX}px;
		--mouse-y: {mouseY}px;
		--gradient-size: {gradientSize}px;
		--gradient-color: {gradientColor};
		--gradient-opacity: {gradientOpacity};
	"
>
	<div
		class="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		style="background: radial-gradient(var(--gradient-size) circle at var(--mouse-x) var(--mouse-y), var(--gradient-color), transparent 60%); opacity: var(--gradient-opacity);"
	></div>
	<div class="relative z-10">
		{@render children()}
	</div>
</div>
