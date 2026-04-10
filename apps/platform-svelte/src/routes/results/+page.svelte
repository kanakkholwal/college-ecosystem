<script lang="ts">
	import type { PageData } from './$types';
	import ResultCard from '$lib/components/application/result/result-card.svelte';
	import ResultSearch from '$lib/components/application/result/result-search.svelte';
	import ResultPagination from '$lib/components/application/result/result-pagination.svelte';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import InView from '$lib/components/animation/in-view.svelte';
	import EmptyArea from '$lib/components/common/empty-area.svelte';
	import { Sparkles, TrendingUp } from 'lucide-svelte';
	import { orgConfig, appConfig } from '$lib/config/project';

	let { data }: { data: PageData } = $props();

	const resultsData = $derived(data.resultsData);
	const labels = $derived(data.labels);
	const currentPage = $derived(data.page);
</script>

<svelte:head>
	<title>{orgConfig.shortName} Results Portal - Check Semester Results Online</title>
	<meta
		name="description"
		content={`${orgConfig.shortName} result portal. Search semester results by roll number, name, or course. Access academic records, grades, and transcripts for all programs.`}
	/>
	<link rel="canonical" href={`${appConfig.url}/results`} />
</svelte:head>

<main
	class="@container mx-auto flex w-full max-w-(--max-app-width) flex-col gap-8 px-4 py-10 md:px-6"
>
	<InView variant="fly-up">
		<section
			class="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-8 md:p-12"
		>
			<div class="mx-auto max-w-3xl space-y-4 text-center">
				<div
					class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
				>
					<Sparkles class="size-3.5 text-primary" />
					{data.session}
				</div>
				<h1 class="text-3xl font-bold tracking-tight md:text-5xl">
					{orgConfig.shortName} Semester Results Portal
				</h1>
				<p class="text-muted-foreground md:text-lg">
					Access official exam results for {orgConfig.name}. Check grades and track academic performance.
				</p>
			</div>

			<div class="mt-8">
				<ResultSearch
					branches={labels.branches}
					batches={labels.batches}
					programmes={labels.programmes}
				/>
			</div>
		</section>
	</InView>

	<section class="space-y-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<TrendingUp class="size-4 text-primary" />
				<span class="font-medium">
					{resultsData.totalCount.toLocaleString()} results found
				</span>
			</div>
			{#if resultsData.totalPages > 1}
				<span class="text-xs text-muted-foreground">
					Page {currentPage} of {resultsData.totalPages}
				</span>
			{/if}
		</div>

		{#if resultsData.results.length === 0}
			<EmptyArea
				title="No Results Found"
				description="Try adjusting your search filters or clear them to see all results."
			/>
		{:else}
			<StaggerContainer
				class="@md:grid-cols-2 @xl:grid-cols-3 @5xl:grid-cols-4 grid grid-cols-1 gap-4"
			>
				{#each resultsData.results as result (result._id)}
					<ResultCard {result} />
				{/each}
			</StaggerContainer>

			<div class="pt-4">
				<ResultPagination totalPages={resultsData.totalPages} {currentPage} />
			</div>
		{/if}
	</section>
</main>
