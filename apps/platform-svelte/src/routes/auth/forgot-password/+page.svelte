<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Loader2, Mail, ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { authClient } from '$lib/auth-client';

	let email = $state('');
	let isLoading = $state(false);
	let sent = $state(false);

	async function onSubmit(e: Event) {
		e.preventDefault();
		if (!email.includes('@')) {
			toast.error('Please enter a valid email');
			return;
		}
		isLoading = true;
		try {
			await authClient.forgetPassword({
				email,
				redirectTo: '/auth/reset-password'
			});
			sent = true;
			toast.success('Check your email for a reset link');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Failed to send reset email');
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Forgot Password | College Platform</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col space-y-2 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">Forgot password?</h1>
		<p class="text-sm text-muted-foreground">
			Enter your email address and we'll send you a link to reset your password.
		</p>
	</div>

	{#if sent}
		<div class="rounded-lg border border-border/60 bg-muted/20 p-4 text-center text-sm">
			<p class="font-medium">Check your inbox</p>
			<p class="mt-1 text-muted-foreground">
				We've sent a password reset link to <strong>{email}</strong>.
			</p>
		</div>
	{:else}
		<form class="space-y-4" onsubmit={onSubmit}>
			<div class="space-y-2">
				<Label for="email">Email Address</Label>
				<div class="relative">
					<Mail class="absolute left-3 top-3 size-4 text-muted-foreground" />
					<Input
						id="email"
						type="email"
						bind:value={email}
						placeholder="you@nith.ac.in"
						class="pl-9"
						autocomplete="email"
						disabled={isLoading}
						required
					/>
				</div>
			</div>

			<Button type="submit" class="w-full" disabled={isLoading}>
				{#if isLoading}
					<Loader2 class="mr-2 size-4 animate-spin" />
				{/if}
				Send Reset Link
			</Button>
		</form>
	{/if}

	<a
		href="/auth/sign-in"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-4" />
		Back to sign in
	</a>
</div>
