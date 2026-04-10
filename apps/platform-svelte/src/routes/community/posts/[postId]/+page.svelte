<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import InView from '$lib/components/animation/in-view.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils';
	import { ArrowLeft, Bookmark, Eye, Heart, Share2, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const post = $derived(data.post);
	const user = $derived(data.user);

	const isLiked = $derived(user ? post.likes.includes(user.id) : false);
	const isSaved = $derived(user ? post.savedBy.includes(user.id) : false);
	const canDelete = $derived(user && (post.author.id === user.id || user.role === 'admin'));

	function timeAgo(date: string | Date): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}d ago`;
		return d.toLocaleDateString();
	}

	async function shareCurrent() {
		if (typeof navigator !== 'undefined' && navigator.share) {
			try {
				await navigator.share({ title: post.title, url: window.location.href });
			} catch {
				// user cancelled
			}
		} else {
			await navigator.clipboard.writeText(window.location.href);
			toast.success('Link copied');
		}
	}
</script>

<svelte:head>
	<title>{post.title} | Community</title>
	<meta name="description" content={post.content.slice(0, 160)} />
</svelte:head>

<main class="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
	<a
		href="/community"
		class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-4" />
		Back to Community
	</a>

	<InView variant="fly-up">
		<Card>
			<CardHeader>
				<div class="flex items-start justify-between gap-4">
					<div class="min-w-0 flex-1">
						<div class="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
							<span class="font-medium">{post.author.name}</span>
							<span>•</span>
							<span>@{post.author.username}</span>
							<span>•</span>
							<span>{timeAgo(post.createdAt)}</span>
						</div>
						<h1 class="text-2xl font-bold tracking-tight md:text-3xl">{post.title}</h1>
					</div>
					{#if post.category}
						<Badge variant="secondary">{post.category}</Badge>
					{/if}
				</div>
			</CardHeader>
			<CardContent class="space-y-6">
				<div class="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
					{post.content}
				</div>

				<Separator />

				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<form method="POST" action="?/toggleLike" use:enhance>
							<Button
								type="submit"
								variant="ghost"
								size="sm"
								class={cn('gap-1.5', isLiked && 'text-red-500')}
								disabled={!user}
							>
								<Heart class={cn('size-4', isLiked && 'fill-current')} />
								{post.likes.length}
							</Button>
						</form>

						<form method="POST" action="?/toggleSave" use:enhance>
							<Button
								type="submit"
								variant="ghost"
								size="sm"
								class={cn('gap-1.5', isSaved && 'text-primary')}
								disabled={!user}
							>
								<Bookmark class={cn('size-4', isSaved && 'fill-current')} />
								{post.savedBy.length}
							</Button>
						</form>

						<span class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
							<Eye class="size-4" />
							{post.views}
						</span>
					</div>

					<div class="flex items-center gap-2">
						<Button variant="ghost" size="sm" onclick={shareCurrent} class="gap-1.5">
							<Share2 class="size-4" />
							Share
						</Button>

						{#if canDelete}
							<form
								method="POST"
								action="?/delete"
								use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											toast.success('Post deleted');
											goto('/community');
										} else if (result.type === 'failure') {
											toast.error((result.data?.error as string) ?? 'Failed');
										}
									};
								}}
							>
								<Button type="submit" variant="ghost" size="sm" class="gap-1.5 text-destructive">
									<Trash2 class="size-4" />
									Delete
								</Button>
							</form>
						{/if}
					</div>
				</div>
			</CardContent>
		</Card>
	</InView>
</main>
