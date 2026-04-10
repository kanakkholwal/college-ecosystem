<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Loader2, Mail, CheckCircle2, XCircle } from 'lucide-svelte';
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let status = $state<'loading' | 'success' | 'error' | 'idle'>('idle');
	let message = $state('');

	onMount(async () => {
		const token = page.url.searchParams.get('token');
		if (!token) return;
		status = 'loading';
		try {
			await authClient.verifyEmail({ query: { token } });
			status = 'success';
			message = 'Your email has been verified. You can now sign in.';
		} catch (e) {
			status = 'error';
			message = e instanceof Error ? e.message : 'Failed to verify email';
		}
	});
</script>

<svelte:head>
	<title>Verify Email | College Platform</title>
</svelte:head>

<div class="space-y-6 text-center">
	{#if status === 'idle'}
		<div
			class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
		>
			<Mail class="size-8" />
		</div>
		<div class="space-y-2">
			<h1 class="text-2xl font-semibold tracking-tight">Check your inbox</h1>
			<p class="text-sm text-muted-foreground">
				We've sent you a verification email. Click the link in the email to verify your account.
			</p>
		</div>
		<Button href="/auth/sign-in" variant="outline" class="w-full">Back to sign in</Button>
	{:else if status === 'loading'}
		<div
			class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
		>
			<Loader2 class="size-8 animate-spin" />
		</div>
		<h1 class="text-2xl font-semibold tracking-tight">Verifying...</h1>
	{:else if status === 'success'}
		<div
			class="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"
		>
			<CheckCircle2 class="size-8" />
		</div>
		<div class="space-y-2">
			<h1 class="text-2xl font-semibold tracking-tight">Email verified!</h1>
			<p class="text-sm text-muted-foreground">{message}</p>
		</div>
		<Button href="/auth/sign-in" class="w-full">Continue to sign in</Button>
	{:else if status === 'error'}
		<div
			class="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"
		>
			<XCircle class="size-8" />
		</div>
		<div class="space-y-2">
			<h1 class="text-2xl font-semibold tracking-tight">Verification failed</h1>
			<p class="text-sm text-muted-foreground">{message}</p>
		</div>
		<Button href="/auth/sign-in" variant="outline" class="w-full">Back to sign in</Button>
	{/if}
</div>
