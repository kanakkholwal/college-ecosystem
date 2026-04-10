<script lang="ts">
	import type { PageProps } from './$types';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import InView from '$lib/components/animation/in-view.svelte';
	import EmptyArea from '$lib/components/common/empty-area.svelte';
	import { Vote, Clock } from 'lucide-svelte';

	let { data }: PageProps = $props();
	const polls = $derived(data.polls);

	const openPolls = $derived(
		polls.filter((p) => p.closesAt && new Date(p.closesAt) > new Date())
	);
	const closedPolls = $derived(
		polls.filter((p) => !p.closesAt || new Date(p.closesAt) <= new Date())
	);
</script>

<svelte:head>
	<title>Polls | College Platform</title>
</svelte:head>

<main class="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 md:px-6">
	<InView variant="fly-up">
		<div class="space-y-2">
			<div
				class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
			>
				<Vote class="size-3.5 text-primary" />
				Campus Voting
			</div>
			<h1 class="text-3xl font-bold tracking-tight md:text-4xl">Polls</h1>
			<p class="text-muted-foreground">Cast your vote on campus opinions and surveys.</p>
		</div>
	</InView>

	{#if polls.length === 0}
		<EmptyArea title="No polls yet" description="Check back later for new polls." />
	{:else}
		{#if openPolls.length > 0}
			<section class="space-y-4">
				<h2 class="text-lg font-semibold">Open Polls</h2>
				<StaggerContainer class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each openPolls as poll (poll._id)}
						<a href={`/polls/${poll._id}`}>
							<Card class="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
								<CardHeader>
									<div class="flex items-start justify-between gap-3">
										<CardTitle class="text-base">{poll.question}</CardTitle>
										<Badge variant="default" class="shrink-0 text-[10px]">Open</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div class="flex items-center justify-between text-xs text-muted-foreground">
										<span>{poll.votes?.length ?? 0} votes</span>
										{#if poll.closesAt}
											<span class="inline-flex items-center gap-1">
												<Clock class="size-3" />
												Closes {new Date(poll.closesAt).toLocaleDateString()}
											</span>
										{/if}
									</div>
								</CardContent>
							</Card>
						</a>
					{/each}
				</StaggerContainer>
			</section>
		{/if}

		{#if closedPolls.length > 0}
			<section class="space-y-4">
				<h2 class="text-lg font-semibold text-muted-foreground">Closed Polls</h2>
				<StaggerContainer class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each closedPolls as poll (poll._id)}
						<a href={`/polls/${poll._id}`}>
							<Card class="h-full opacity-80 transition-all hover:-translate-y-0.5 hover:opacity-100">
								<CardHeader>
									<div class="flex items-start justify-between gap-3">
										<CardTitle class="text-base">{poll.question}</CardTitle>
										<Badge variant="secondary" class="shrink-0 text-[10px]">Closed</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div class="text-xs text-muted-foreground">
										{poll.votes?.length ?? 0} total votes
									</div>
								</CardContent>
							</Card>
						</a>
					{/each}
				</StaggerContainer>
			</section>
		{/if}
	{/if}
</main>
