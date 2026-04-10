<script lang="ts">
	import InView from '$lib/components/animation/in-view.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { orgConfig } from '$lib/config/project';
	import { Chat, type UIMessage } from '@ai-sdk/svelte';
	import { Bot, Loader2, Send, Sparkles, User } from 'lucide-svelte';

	const chat = new Chat({ messages: [] as UIMessage[] });

	let input = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!input.trim()) return;
		chat.sendMessage({ text: input });
		input = '';
	}
</script>

<svelte:head>
	<title>AI Assistant | College Platform</title>
	<meta name="description" content="Chat with our AI assistant about campus, academics, and more." />
</svelte:head>

<main class="mx-auto flex h-[calc(100svh-4rem)] w-full max-w-4xl flex-col px-4 py-6 md:px-6">
	<InView variant="fly-up">
		<div class="mb-4 space-y-2 text-center">
			<div
				class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
			>
				<Sparkles class="size-3.5 text-primary" />
				Alpha
			</div>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">AI Assistant</h1>
			<p class="text-sm text-muted-foreground">
				Ask questions about {orgConfig.shortName} and get instant answers.
			</p>
		</div>
	</InView>

	<Card class="flex min-h-0 flex-1 flex-col overflow-hidden">
		<div class="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
			{#if chat.messages.length === 0}
				<div class="flex h-full flex-col items-center justify-center gap-3 text-center">
					<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Bot class="size-6" />
					</div>
					<p class="text-sm text-muted-foreground">
						Ask me anything about courses, results, hostels, or campus life.
					</p>
				</div>
			{:else}
				{#each chat.messages as message (message.id)}
					<div class="flex gap-3 {message.role === 'user' ? 'justify-end' : 'justify-start'}">
						{#if message.role === 'assistant'}
							<div
								class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
							>
								<Bot class="size-4" />
							</div>
						{/if}
						<div
							class="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm {message.role === 'user'
								? 'bg-primary text-primary-foreground'
								: 'bg-muted/60'}"
						>
							{#each message.parts as part, i (i)}
								{#if part.type === 'text'}
									<p class="whitespace-pre-wrap">{part.text}</p>
								{/if}
							{/each}
						</div>
						{#if message.role === 'user'}
							<div
								class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
							>
								<User class="size-4" />
							</div>
						{/if}
					</div>
				{/each}
				{#if chat.status === 'streaming' || chat.status === 'submitted'}
					<div class="flex items-center gap-2 text-xs text-muted-foreground">
						<Loader2 class="size-3 animate-spin" /> thinking...
					</div>
				{/if}
			{/if}
		</div>

		<form onsubmit={handleSubmit} class="flex items-center gap-2 border-t border-border/60 p-3">
			<Input
				bind:value={input}
				placeholder="Ask something..."
				disabled={chat.status === 'streaming'}
				class="flex-1"
			/>
			<Button type="submit" disabled={chat.status === 'streaming' || !input.trim()} size="icon">
				<Send class="size-4" />
			</Button>
		</form>
	</Card>
</main>
