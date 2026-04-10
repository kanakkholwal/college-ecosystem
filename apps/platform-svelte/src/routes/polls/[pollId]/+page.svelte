<script lang="ts">
	import { enhance } from '$app/forms';
	import InView from '$lib/components/animation/in-view.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowLeft, Clock, Users, Vote } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const poll = $derived(data.poll);
	const user = $derived(data.user);

	const isOpen = $derived(poll.closesAt && new Date(poll.closesAt) > new Date());
	const totalVotes = $derived(poll.votes?.length ?? 0);
	const hasVoted = $derived(user ? poll.votes?.some((v) => v.userId === user.id) : false);
</script>

<svelte:head>
	<title>{poll.question} | Polls</title>
</svelte:head>

<main class="mx-auto w-full max-w-2xl space-y-6 px-4 py-10 md:px-6">
	<a
		href="/polls"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-4" />
		Back to Polls
	</a>

	<InView variant="fly-up">
		<Card>
			<CardHeader>
				<div class="flex items-start justify-between gap-3">
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<Vote class="size-5 text-primary" />
							<Badge variant={isOpen ? 'default' : 'secondary'}>
								{isOpen ? 'Open' : 'Closed'}
							</Badge>
						</div>
						<CardTitle class="text-xl md:text-2xl">{poll.question}</CardTitle>
					</div>
				</div>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if poll.options && poll.options.length > 0}
					<div class="space-y-2">
						{#each poll.options as option (option)}
							{@const voteCount = poll.votes?.length ?? 0}
							{@const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0}
							<form method="POST" action="?/vote" use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'failure') {
										toast.error((result.data?.error as string) ?? 'Failed to vote');
									} else if (result.type === 'success') {
										toast.success('Vote recorded');
									}
								};
							}}>
								<input type="hidden" name="optionId" value={option.id ?? option.label} />
								<button
									type="submit"
									disabled={!isOpen || !user || hasVoted}
									class="group relative w-full overflow-hidden rounded-lg border border-border/60 bg-muted/20 p-4 text-left transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-70"
								>
									<div
										class="absolute inset-y-0 left-0 bg-primary/10 transition-all"
										style="width: {percent}%"
									></div>
									<div class="relative flex items-center justify-between">
										<span class="font-medium">{option.label}</span>
										<span class="text-sm text-muted-foreground">
											{voteCount} ({percent}%)
										</span>
									</div>
								</button>
							</form>
						{/each}
					</div>
				{/if}

				<div class="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
					<span class="inline-flex items-center gap-1.5">
						<Users class="size-3.5" />
						{totalVotes} total votes
					</span>
					{#if poll.closesAt}
						<span class="inline-flex items-center gap-1.5">
							<Clock class="size-3.5" />
							{isOpen ? 'Closes' : 'Closed'} {new Date(poll.closesAt).toLocaleDateString()}
						</span>
					{/if}
				</div>

				{#if !user}
					<p class="text-center text-xs text-muted-foreground">
						<a href="/auth/sign-in" class="underline">Sign in</a> to vote on this poll.
					</p>
				{/if}
			</CardContent>
		</Card>
	</InView>
</main>
