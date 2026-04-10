<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Loader2, Lock } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let password = $state('');
	let confirm = $state('');
	let isLoading = $state(false);

	const token = $derived(page.url.searchParams.get('token') ?? '');

	async function onSubmit(e: Event) {
		e.preventDefault();
		if (password.length < 8) {
			toast.error('Password must be at least 8 characters');
			return;
		}
		if (password !== confirm) {
			toast.error('Passwords do not match');
			return;
		}
		if (!token) {
			toast.error('Invalid or missing reset token');
			return;
		}
		isLoading = true;
		try {
			await authClient.resetPassword({ newPassword: password, token });
			toast.success('Password reset successfully');
			goto('/auth/sign-in');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Failed to reset password');
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Reset Password | College Platform</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col space-y-2 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">Reset your password</h1>
		<p class="text-sm text-muted-foreground">Enter a new password for your account.</p>
	</div>

	<form class="space-y-4" onsubmit={onSubmit}>
		<div class="space-y-2">
			<Label for="new-password">New Password</Label>
			<div class="relative">
				<Lock class="absolute left-3 top-3 size-4 text-muted-foreground" />
				<Input
					id="new-password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					class="pl-9"
					autocomplete="new-password"
					disabled={isLoading}
					required
					minlength={8}
				/>
			</div>
		</div>

		<div class="space-y-2">
			<Label for="confirm">Confirm Password</Label>
			<div class="relative">
				<Lock class="absolute left-3 top-3 size-4 text-muted-foreground" />
				<Input
					id="confirm"
					type="password"
					bind:value={confirm}
					placeholder="••••••••"
					class="pl-9"
					autocomplete="new-password"
					disabled={isLoading}
					required
					minlength={8}
				/>
			</div>
		</div>

		<Button type="submit" class="w-full" disabled={isLoading}>
			{#if isLoading}
				<Loader2 class="mr-2 size-4 animate-spin" />
			{/if}
			Reset Password
		</Button>
	</form>
</div>
