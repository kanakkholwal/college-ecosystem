<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import InView from '$lib/components/animation/in-view.svelte';
	import { MessageCircleMore, Construction } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Whisper Feed | Anonymous Posts</title>
</svelte:head>

<main class="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 md:px-6">
	<InView variant="fly-up">
		<div class="space-y-2">
			<div class="flex items-center gap-2">
				<MessageCircleMore class="size-5 text-primary" />
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl">Whisper Feed</h1>
			</div>
			<p class="text-muted-foreground">Anonymous confessions and stories from the community.</p>
		</div>
	</InView>

	<InView variant="fly-up">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-lg">
					<Construction class="size-5 text-primary" />
					Feed Coming Soon
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground">
					The whisper feed is being rebuilt with real-time updates and better moderation. Check
					back soon.
				</p>
			</CardContent>
		</Card>
	</InView>
</main>
