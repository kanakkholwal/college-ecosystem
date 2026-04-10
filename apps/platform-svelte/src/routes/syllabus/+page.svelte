<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import InView from '$lib/components/animation/in-view.svelte';
	import EmptyArea from '$lib/components/common/empty-area.svelte';
	import { BookOpen, Search, ArrowRight } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/state';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state(data.query);

	function onSearch(e: Event) {
		e.preventDefault();
		const params = new URLSearchParams(pageStore.url.searchParams);
		if (searchQuery) params.set('query', searchQuery);
		else params.delete('query');
		params.set('page', '1');
		goto(`/syllabus?${params.toString()}`);
	}
</script>

<svelte:head>
	<title>Syllabus - Course Catalog</title>
	<meta name="description" content="Browse course syllabus, books, and previous papers." />
</svelte:head>

<main class="mx-auto w-full max-w-(--max-app-width) space-y-8 px-4 py-10 md:px-6">
	<InView variant="fly-up">
		<div class="space-y-3">
			<div
				class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
			>
				<BookOpen class="size-3.5 text-primary" />
				Course Catalog
			</div>
			<h1 class="text-3xl font-bold tracking-tight md:text-4xl">Syllabus & Course Materials</h1>
			<p class="max-w-2xl text-muted-foreground">
				Browse course syllabi, recommended books, and previous year question papers.
			</p>
		</div>
	</InView>

	<form onsubmit={onSearch} class="flex items-center gap-2">
		<div class="relative flex-1">
			<Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				bind:value={searchQuery}
				placeholder="Search by course code or name..."
				class="pl-9"
			/>
		</div>
		<Button type="submit">Search</Button>
	</form>

	{#if data.courses.length === 0}
		<EmptyArea title="No courses found" description="Try adjusting your search." />
	{:else}
		<StaggerContainer class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.courses as course (course.id)}
				<a href={`/syllabus/${course.code}`} class="block">
					<Card
						class="h-full transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
					>
						<CardHeader class="pb-3">
							<div class="flex items-start justify-between gap-2">
								<Badge variant="secondary" class="font-mono text-[10px]">{course.code}</Badge>
								<Badge variant="outline" class="text-[10px]">{course.type}</Badge>
							</div>
							<CardTitle class="mt-2 line-clamp-2 text-base">{course.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="flex items-center justify-between text-xs">
								<span class="text-muted-foreground">{course.department}</span>
								<span class="inline-flex items-center gap-1 text-primary">
									View <ArrowRight class="size-3" />
								</span>
							</div>
						</CardContent>
					</Card>
				</a>
			{/each}
		</StaggerContainer>
	{/if}
</main>
