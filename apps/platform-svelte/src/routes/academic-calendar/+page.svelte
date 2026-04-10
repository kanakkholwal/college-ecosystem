<script lang="ts">
	import InView from '$lib/components/animation/in-view.svelte';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import EmptyArea from '$lib/components/common/empty-area.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Calendar, Clock } from 'lucide-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const events = $derived(data.events);
</script>

<svelte:head>
	<title>Academic Calendar | College Platform</title>
	<meta name="description" content="Yearly schedule of exams, holidays, and academic events." />
</svelte:head>

<main class="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 md:px-6">
	<InView variant="fly-up">
		<div class="space-y-2">
			<div
				class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
			>
				<Calendar class="size-3.5 text-primary" />
				{new Date().getFullYear()}
			</div>
			<h1 class="text-3xl font-bold tracking-tight md:text-4xl">Academic Calendar</h1>
			<p class="text-muted-foreground">Yearly schedule of exams, holidays, and academic events.</p>
		</div>
	</InView>

	{#if events.length === 0}
		<EmptyArea title="No events scheduled" description="Check back later for calendar updates." />
	{:else}
		<StaggerContainer class="space-y-6">
			{#each events as dayGroup (dayGroup.day)}
				<div class="space-y-3">
					<h2
						class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
					>
						<Clock class="size-4" />
						{new Date(dayGroup.day).toLocaleDateString(undefined, {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</h2>
					<div class="space-y-2">
						{#each dayGroup.events as event (event.id)}
							<Card class="transition-all hover:-translate-y-0.5 hover:shadow-md">
								<CardHeader class="pb-3">
									<div class="flex items-start justify-between gap-3">
										<CardTitle class="text-base">{event.title}</CardTitle>
										{#if event.location}
											<Badge variant="secondary" class="text-[10px]">{event.location}</Badge>
										{/if}
									</div>
								</CardHeader>
								{#if event.description}
									<CardContent>
										<p class="text-sm text-muted-foreground">{event.description}</p>
									</CardContent>
								{/if}
							</Card>
						{/each}
					</div>
				</div>
			{/each}
		</StaggerContainer>
	{/if}
</main>
