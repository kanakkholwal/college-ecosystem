<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		number = 20,
		class: className = ''
	}: { number?: number; class?: string } = $props();

	const meteors = $derived(
		Array.from({ length: number }, (_, i) => ({
			key: i,
			top: Math.floor(Math.random() * 100) + '%',
			left: Math.floor(Math.random() * 100) + '%',
			delay: (Math.random() * 0.6 + 0.2).toFixed(2) + 's',
			duration: (Math.random() * 8 + 2).toFixed(2) + 's'
		}))
	);
</script>

<div class={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
	{#each meteors as m (m.key)}
		<span
			class="meteor"
			style="top: {m.top}; left: {m.left}; animation-delay: {m.delay}; animation-duration: {m.duration};"
		></span>
	{/each}
</div>

<style>
	.meteor {
		position: absolute;
		width: 2px;
		height: 2px;
		border-radius: 9999px;
		background: hsl(var(--muted-foreground));
		box-shadow: 0 0 0 1px hsla(var(--muted-foreground), 0.1);
		animation-name: meteor;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		transform: rotate(215deg);
	}
	.meteor::before {
		content: '';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 50px;
		height: 1px;
		background: linear-gradient(90deg, hsl(var(--muted-foreground)), transparent);
	}
	@keyframes meteor {
		0% {
			transform: rotate(215deg) translateX(0);
			opacity: 1;
		}
		70% {
			opacity: 1;
		}
		100% {
			transform: rotate(215deg) translateX(-500px);
			opacity: 0;
		}
	}
</style>
