<script lang="ts">
	import type { PageData } from './$types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import CommunityPostCard from '$lib/components/application/community/community-post-card.svelte';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import InView from '$lib/components/animation/in-view.svelte';
	import EmptyArea from '$lib/components/common/empty-area.svelte';
	import { Globe, MessageSquarePlus } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	const posts = $derived(data.posts);
	const category = $derived(data.category);
	const user = $derived(data.user);
</script>

<svelte:head>
	<title>Community Feed - College Platform</title>
	<meta name="description" content="Join the conversation with your peers." />
</svelte:head>

<main class="mx-auto w-full max-w-(--max-app-width) px-4 py-8 md:px-6">
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div class="min-h-screen space-y-6 lg:col-span-2">
			<div
				class="sticky top-20 z-30 rounded-xl border border-border/40 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-xl"
			>
				<div class="flex items-center justify-between gap-3">
					<div class="flex min-w-0 items-center gap-3">
						<div
							class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-sm"
						>
							<Globe class="size-5" />
						</div>
						<div class="flex min-w-0 flex-col">
							<h1 class="flex items-center gap-2 text-sm font-bold text-foreground">
								{category === 'all' ? 'Global Feed' : `c/${category}`}
								<Badge class="font-mono text-[10px]">{posts.length}</Badge>
							</h1>
							<p class="line-clamp-1 text-xs text-muted-foreground">
								{category === 'all' ? 'All public conversations' : 'Community discussions'}
							</p>
						</div>
					</div>

					<Button
						href={user ? '/community/create' : '/auth/sign-in?next=/community/create'}
						size="sm"
						class="gap-2"
					>
						<MessageSquarePlus class="size-4" />
						<span class="hidden sm:inline">New Post</span>
					</Button>
				</div>
			</div>

			{#if posts.length === 0}
				<EmptyArea
					title="No posts yet"
					description="Be the first to start a conversation in this community."
				/>
			{:else}
				<StaggerContainer class="space-y-4">
					{#each posts as post (post._id)}
						<CommunityPostCard {post} />
					{/each}
				</StaggerContainer>
			{/if}
		</div>

		<aside class="hidden lg:block">
			<InView variant="fly-right">
				<div
					class="sticky top-24 overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm"
				>
					<div class="relative h-16 bg-accent/50">
						<div
							class="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent"
						></div>
					</div>
					<div class="-mt-8 px-5 pb-5">
						<div
							class="relative mb-3 size-16 overflow-hidden rounded-xl border-4 border-card bg-background shadow-sm"
						>
							<div
								class="flex size-full items-center justify-center bg-primary/5 text-primary"
							>
								<Globe class="size-8" />
							</div>
						</div>

						<h2 class="text-lg font-bold">Community</h2>
						<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
							Welcome to the NITH community forum. A place to share ideas, ask questions, and
							connect with peers.
						</p>

						<div class="mt-4 flex gap-6 border-y border-border/50 py-4">
							<div class="flex flex-col">
								<span class="text-base font-bold">{posts.length}</span>
								<span class="text-xs text-muted-foreground">Posts</span>
							</div>
							<div class="flex flex-col">
								<span class="text-base font-bold">—</span>
								<span class="text-xs text-muted-foreground">Online</span>
							</div>
						</div>

						<div class="mt-4 space-y-2">
							<h4
								class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
							>
								Posting Rules
							</h4>
							<ul class="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
								<li>Be respectful and civil.</li>
								<li>No spam or self-promotion.</li>
								<li>Keep discussions relevant.</li>
							</ul>
						</div>
					</div>
				</div>
			</InView>
		</aside>
	</div>
</main>
