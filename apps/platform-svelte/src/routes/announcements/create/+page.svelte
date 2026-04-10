<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import InView from '$lib/components/animation/in-view.svelte';
	import { ArrowLeft, Loader2, Megaphone } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Create Announcement</title>
</svelte:head>

<main class="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
	<a
		href="/announcements"
		class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-4" />
		Back to Announcements
	</a>

	<InView variant="fly-up">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Megaphone class="size-6 text-primary" />
					New Announcement
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
								toast.error((result.data?.error as string) ?? 'Failed');
							} else if (result.type === 'redirect') {
								toast.success('Announcement published');
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
							placeholder="Announcement title"
							value={form?.title ?? ''}
							required
							minlength={3}
						/>
					</div>

					<div class="space-y-2">
						<Label for="relatedFor">Related For</Label>
						<select
							id="relatedFor"
							name="relatedFor"
							value={form?.relatedFor ?? 'academics'}
							class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
						>
							{#each data.relatedForTypes as rf (rf)}
								<option value={rf}>{rf}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<Label for="description">Description</Label>
						<textarea
							id="description"
							name="description"
							rows={6}
							required
							minlength={10}
							class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
							>{form?.description ?? ''}</textarea
						>
					</div>

					{#if form?.error}
						<p class="text-sm text-destructive">{form.error}</p>
					{/if}

					<div class="flex gap-3">
						<Button type="submit" disabled={submitting}>
							{#if submitting}
								<Loader2 class="mr-2 size-4 animate-spin" />
							{/if}
							Publish
						</Button>
						<Button type="button" variant="outline" href="/announcements">Cancel</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</InView>
</main>
