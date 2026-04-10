<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import { ArrowRight, Award, TrendingDown, TrendingUp, Trophy } from 'lucide-svelte';

	type ResultType = {
		_id: string;
		name: string;
		rollNo: string;
		branch: string;
		batch: number;
		programme: string;
		cgpi: number;
		prevCgpi?: number;
		rank: {
			college: number;
			batch: number;
			branch: number;
			class: number;
		};
	};

	let {
		result,
		class: className = ''
	}: { result: ResultType; class?: string } = $props();

	const trend = $derived(result.prevCgpi !== undefined ? result.cgpi - result.prevCgpi : 0);

	const rankStyle = $derived.by(() => {
		const r = result.rank.college;
		if (r === 1) return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
		if (r === 2) return 'bg-rose-400/10 text-rose-600 border-rose-400/20';
		if (r === 3) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
		return 'bg-primary/5 text-primary border-primary/20';
	});
</script>

<div
	class={cn(
		'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
		className
	)}
>
	<div
		class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
	></div>

	<div class="relative z-10 mb-6 flex items-start justify-between">
		<div class="min-w-0 flex-1">
			<h3 class="line-clamp-1 text-lg font-semibold leading-tight text-foreground">
				{result.name}
			</h3>
			<div class="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
				<span class="rounded bg-muted/50 px-1.5 py-0.5 font-mono">{result.rollNo}</span>
				{#if result.programme}
					<span class="h-1 w-1 rounded-full bg-border"></span>
					<span class="max-w-30 truncate">{result.programme}</span>
				{/if}
			</div>
		</div>

		<Badge variant="outline" class={cn('flex items-center gap-1 text-xs font-semibold', rankStyle)}>
			{#if result.rank.college <= 3}
				<Trophy class="size-3" />
			{:else}
				<Award class="size-3" />
			{/if}
			#{result.rank.college}
		</Badge>
	</div>

	<div class="relative z-10 mb-6 grid grid-cols-2 gap-4">
		<div>
			<p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
				CGPI
			</p>
			<div class="flex items-end gap-2">
				<span class="text-3xl font-bold tracking-tight text-foreground">
					{result.cgpi?.toFixed(2) ?? '-'}
				</span>
				{#if trend !== 0}
					<div
						class={cn(
							'mb-1.5 flex items-center text-xs font-medium',
							trend > 0 ? 'text-emerald-600' : 'text-rose-600'
						)}
					>
						{#if trend > 0}
							<TrendingUp class="mr-0.5 size-3" />
						{:else}
							<TrendingDown class="mr-0.5 size-3" />
						{/if}
						{Math.abs(trend).toFixed(2)}
					</div>
				{/if}
			</div>
		</div>

		<div class="space-y-1.5">
			<div class="flex items-center justify-between text-xs">
				<span class="text-muted-foreground">Branch</span>
				<span class="font-mono font-medium">#{result.rank.branch}</span>
			</div>
			<div class="flex items-center justify-between text-xs">
				<span class="text-muted-foreground">Batch</span>
				<span class="font-mono font-medium">#{result.rank.batch}</span>
			</div>
			<div class="flex items-center justify-between text-xs">
				<span class="text-muted-foreground">Class</span>
				<span class="font-mono font-medium">#{result.rank.class}</span>
			</div>
		</div>
	</div>

	<div
		class="relative z-10 flex items-center justify-between border-t border-border/40 pt-4"
	>
		<span class="text-xs font-medium text-muted-foreground">
			Batch {result.batch || 'N/A'}
		</span>

		<a
			href={`/results/${result.rollNo}`}
			class="flex items-center gap-1 text-xs font-semibold text-primary opacity-80 transition-opacity hover:opacity-100"
		>
			View Report
			<ArrowRight class="size-3" />
		</a>
	</div>
</div>
