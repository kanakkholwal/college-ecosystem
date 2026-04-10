<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		class: className = '',
		size = 200,
		duration = 15,
		anchor = 90,
		borderWidth = 1.5,
		colorFrom = '#ffaa40',
		colorTo = '#9c40ff',
		delay = 0
	}: {
		class?: string;
		size?: number;
		duration?: number;
		anchor?: number;
		borderWidth?: number;
		colorFrom?: string;
		colorTo?: string;
		delay?: number;
	} = $props();
</script>

<div
	class={cn('border-beam', className)}
	style="
		--size: {size};
		--duration: {duration}s;
		--anchor: {anchor}%;
		--border-width: {borderWidth}px;
		--color-from: {colorFrom};
		--color-to: {colorTo};
		--delay: -{delay}s;
	"
></div>

<style>
	.border-beam {
		pointer-events: none;
		position: absolute;
		inset: 0;
		border-radius: inherit;
		border: calc(var(--border-width) * 1px) solid transparent;
		-webkit-mask-clip: padding-box, border-box;
		mask-clip: padding-box, border-box;
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		-webkit-mask-image:
			linear-gradient(transparent, transparent),
			linear-gradient(#000, #000);
		mask-image:
			linear-gradient(transparent, transparent),
			linear-gradient(#000, #000);
	}
	.border-beam::after {
		content: '';
		position: absolute;
		aspect-ratio: 1;
		width: calc(var(--size) * 1px);
		animation: border-beam var(--duration) infinite linear;
		animation-delay: var(--delay);
		background: linear-gradient(to left, var(--color-from), var(--color-to), transparent);
		offset-path: rect(0 auto auto 0 round calc(var(--size) * 1px));
	}
	@keyframes border-beam {
		to {
			offset-distance: 100%;
		}
	}
</style>
