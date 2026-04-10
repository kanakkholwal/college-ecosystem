<script lang="ts">
	import InView from '$lib/components/animation/in-view.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { MessageCircleMore, ShieldCheck, Sparkles, ArrowRight } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Whisper Room | Anonymous Confessions</title>
	<meta name="description" content="Share your thoughts anonymously with the NITH community." />
</svelte:head>

<main class="mx-auto w-full max-w-4xl space-y-10 px-4 py-10 md:px-6">
	<InView variant="fly-up">
		<section class="space-y-4 text-center">
			<div
				class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
			>
				<Sparkles class="size-3.5 text-primary" />
				Anonymous
			</div>
			<h1 class="text-4xl font-bold tracking-tight md:text-5xl">Whisper Room</h1>
			<p class="mx-auto max-w-2xl text-muted-foreground md:text-lg">
				A safe space to share confessions, thoughts, and stories without revealing your identity.
			</p>
		</section>
	</InView>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<InView variant="fly-up">
			<Card class="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
				<CardHeader>
					<div class="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<MessageCircleMore class="size-5" />
					</div>
					<CardTitle>Browse the Feed</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<p class="text-sm text-muted-foreground">
						Read anonymous confessions, stories, and thoughts from fellow students.
					</p>
					<Button href="/whisper-room/feed" class="gap-2">
						Open Feed <ArrowRight class="size-4" />
					</Button>
				</CardContent>
			</Card>
		</InView>

		<InView variant="fly-up">
			<Card class="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
				<CardHeader>
					<div class="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<ShieldCheck class="size-5" />
					</div>
					<CardTitle>Share a Whisper</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<p class="text-sm text-muted-foreground">
						Write a new whisper anonymously. Your identity is never stored or shared.
					</p>
					<Button href="/whisper-room/whisper" variant="outline" class="gap-2">
						Create Whisper <ArrowRight class="size-4" />
					</Button>
				</CardContent>
			</Card>
		</InView>
	</div>
</main>
