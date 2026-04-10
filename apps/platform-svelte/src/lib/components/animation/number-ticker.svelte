<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { inview } from '$lib/actions/inview';
	import { cn } from '$lib/utils';

	let {
		value,
		duration = 1600,
		delay = 0,
		decimals = 0,
		prefix = '',
		suffix = '',
		class: className = ''
	}: {
		value: number;
		duration?: number;
		delay?: number;
		decimals?: number;
		prefix?: string;
		suffix?: string;
		class?: string;
	} = $props();

	const displayed = new Tween(0, { duration, easing: cubicOut, delay });
	let started = $state(false);

	const formatted = $derived.by(() => {
		const n = displayed.current;
		return n.toLocaleString(undefined, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		});
	});
</script>

<span
	use:inview={{ once: true, threshold: 0.3 }}
	oninview={() => {
		if (!started) {
			started = true;
			displayed.target = value;
		}
	}}
	class={cn('tabular-nums', className)}
>
	{prefix}{formatted}{suffix}
</span>
