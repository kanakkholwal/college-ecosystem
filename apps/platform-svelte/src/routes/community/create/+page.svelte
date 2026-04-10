<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowLeft, Loader2, MessageSquarePlus } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import InView from '$lib/components/animation/in-view.svelte';
	import { CATEGORY_TYPES } from '$lib/constants/common.community';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
</script>

<svelte:head>
	<title>Create Post | Community</title>
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
				<CardTitle class="flex items-center gap-2 text-2xl">
					<MessageSquarePlus class="size-6 text-primary" />
					Create a Post
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					use:enhance={() => {
						submitting = true;
						return async ({ result, update }) => {
							submitting = false;
							if (result.type === 'failure') {
								toast.error((result.data?.error as string) ?? 'Failed to create post');
							} else if (result.type === 'redirect') {
								toast.success('Post created successfully');
							}
							await update();
						};
					}}
					class="space-y-4"
				>
					<div class="space-y-2">
						<Label for="title">Title</Label>
						<Input
							id="title"
							name="title"
							placeholder="What's on your mind?"
							value={form?.title ?? ''}
							required
							minlength={3}
							maxlength={200}
						/>
					</div>

					<div class="space-y-2">
						<Label for="category">Category</Label>
						<select
							id="category"
							name="category"
							value={form?.category ?? data.defaultCategory}
							class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
						>
							{#each CATEGORY_TYPES as cat (cat)}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<Label for="content">Content</Label>
						<textarea
							id="content"
							name="content"
							placeholder="Share details..."
							rows={8}
							required
							minlength={10}
							class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
							>{form?.content ?? ''}</textarea
						>
					</div>

					{#if form?.error}
						<p class="text-sm text-destructive">{form.error}</p>
					{/if}

					<div class="flex items-center gap-3">
						<Button type="submit" disabled={submitting}>
							{#if submitting}
								<Loader2 class="mr-2 size-4 animate-spin" />
							{/if}
							Publish Post
						</Button>
						<Button type="button" variant="outline" href="/community">Cancel</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</InView>
</main>
