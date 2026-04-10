<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import InView from '$lib/components/animation/in-view.svelte';
	import { toast } from 'svelte-sonner';
	import { ShieldCheck, Send } from 'lucide-svelte';

	let content = $state('');
	let submitting = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		if (content.trim().length < 10) {
			toast.error('Whisper must be at least 10 characters');
			return;
		}
		submitting = true;
		try {
			// TODO: wire to whisper action once the feed is live
			toast.success('Whisper submitted (feature coming soon)');
			content = '';
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Failed to submit');
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Send Whisper | Anonymous</title>
</svelte:head>

<main class="mx-auto w-full max-w-2xl space-y-6 px-4 py-10 md:px-6">
	<InView variant="fly-up">
		<Card>
			<CardHeader>
				<div class="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<ShieldCheck class="size-5" />
				</div>
				<CardTitle>Share a Whisper</CardTitle>
				<p class="text-sm text-muted-foreground">
					Your identity is never stored. Write freely and respectfully.
				</p>
			</CardHeader>
			<CardContent>
				<form onsubmit={submit} class="space-y-4">
					<textarea
						bind:value={content}
						placeholder="What's on your mind..."
						rows={6}
						minlength={10}
						maxlength={1000}
						required
						class="w-full rounded-md border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					></textarea>
					<div class="flex items-center justify-between text-xs text-muted-foreground">
						<span>{content.length}/1000</span>
						<Button type="submit" disabled={submitting} class="gap-2">
							<Send class="size-4" />
							Submit
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</InView>
</main>
