<script lang="ts">
	import InView from '$lib/components/animation/in-view.svelte';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import EmptyArea from '$lib/components/common/empty-area.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Megaphone, Plus } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const announcements = $derived(data.announcements);
	const canCreate = $derived(
		!!data.user && (data.user.role === 'admin' || data.user.other_roles.includes('faculty'))
	);

	function timeAgo(date: string | Date): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		const diff = Date.now() - d.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days}d ago`;
		return d.toLocaleDateString();
	}
</script>

<svelte:head>
	<title>Announcements | College Platform</title>
</svelte:head>

<main class="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 md:px-6">
	<InView variant="fly-up">
		<div class="flex items-start justify-between gap-4">
			<div class="space-y-2">
				<div
					class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
				>
					<Megaphone class="size-3.5 text-primary" />
					Official Updates
				</div>
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl">Announcements</h1>
				<p class="text-muted-foreground">Official news and campus updates.</p>
			</div>
			{#if canCreate}
				<Button href="/announcements/create" class="gap-2">
					<Plus class="size-4" />
					<span class="hidden sm:inline">New</span>
				</Button>
			{/if}
		</div>
	</InView>

	{#if announcements.length === 0}
		<EmptyArea title="No announcements" description="Check back later for updates." />
	{:else}
		<StaggerContainer class="space-y-4">
			{#each announcements as announcement (announcement._id)}
				<Card class="transition-all hover:-translate-y-0.5 hover:shadow-md">
					<CardHeader class="pb-3">
						<div class="flex items-start justify-between gap-3">
							<CardTitle class="text-lg">{announcement.title}</CardTitle>
							<Badge variant="outline" class="shrink-0 text-xs">
								{timeAgo(announcement.createdAt)}
							</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<p class="whitespace-pre-wrap text-sm text-muted-foreground">
							{announcement.content ?? ''}
						</p>
						<div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
							<span class="font-medium">By {announcement.createdBy?.name ?? 'Admin'}</span>
							{#if announcement.relatedFor}
								<span>•</span>
								<Badge variant="secondary" class="text-[10px]">{announcement.relatedFor}</Badge>
							{/if}
						</div>
					</CardContent>
				</Card>
			{/each}
		</StaggerContainer>
	{/if}
</main>
