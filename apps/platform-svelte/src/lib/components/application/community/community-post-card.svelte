<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Heart, MessageCircle, Eye, Bookmark } from 'lucide-svelte';

	type Post = {
		_id: string;
		title: string;
		content: string;
		category?: string;
		author: { id: string; name: string; username: string };
		likes: string[];
		savedBy: string[];
		views: number;
		createdAt: string;
	};

	let { post }: { post: Post } = $props();

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
</script>

<Card
	class="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5"
>
	<a href={`/community/posts/${post._id}`} class="block">
		<CardHeader class="pb-3">
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0 flex-1">
					<div class="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
						<span class="font-medium">{post.author.name}</span>
						<span>•</span>
						<span>@{post.author.username}</span>
						<span>•</span>
						<span>{timeAgo(post.createdAt)}</span>
					</div>
					<h3 class="line-clamp-2 text-base font-semibold tracking-tight">{post.title}</h3>
				</div>
				{#if post.category}
					<Badge variant="secondary" class="shrink-0 text-xs">{post.category}</Badge>
				{/if}
			</div>
		</CardHeader>
		<CardContent class="pt-0">
			<p class="line-clamp-3 text-sm text-muted-foreground">{post.content}</p>

			<div class="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
				<span class="inline-flex items-center gap-1">
					<Heart class="size-3.5" />
					{post.likes.length}
				</span>
				<span class="inline-flex items-center gap-1">
					<MessageCircle class="size-3.5" />
					0
				</span>
				<span class="inline-flex items-center gap-1">
					<Eye class="size-3.5" />
					{post.views}
				</span>
				<span class="inline-flex items-center gap-1">
					<Bookmark class="size-3.5" />
					{post.savedBy.length}
				</span>
			</div>
		</CardContent>
	</a>
</Card>
