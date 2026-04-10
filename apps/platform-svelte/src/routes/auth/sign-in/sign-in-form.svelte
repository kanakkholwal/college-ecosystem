<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Loader2, Lock, Mail } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { authClient } from '$lib/auth-client';
	import { orgConfig } from '$lib/config/project';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let isLoading = $state(false);
	let emailError = $state<string | null>(null);
	let passwordError = $state<string | null>(null);

	function validate(): boolean {
		emailError = null;
		passwordError = null;
		if (!email || !email.includes('@')) {
			emailError = 'Invalid email address';
			return false;
		}
		if (!email.endsWith(orgConfig.mailSuffix)) {
			emailError = `Must use organization email (${orgConfig.mailSuffix})`;
			return false;
		}
		if (!password) {
			passwordError = 'Password is required';
			return false;
		}
		return true;
	}

	async function onSubmit(e: Event) {
		e.preventDefault();
		if (!validate()) return;

		const redirect = page.url.searchParams.get('next') || '/';

		await authClient.signIn.email(
			{ email, password, callbackURL: redirect, rememberMe },
			{
				onRequest: () => {
					isLoading = true;
				},
				onResponse: () => {
					isLoading = false;
				},
				onSuccess: () => {
					toast.success('Welcome back!');
					goto(redirect);
				},
				onError: (ctx) => {
					if (ctx.error.status === 403) {
						toast.error('Please verify your email address first.');
					} else {
						toast.error(ctx.error.message || 'Invalid credentials');
					}
				}
			}
		);
	}

	async function signInWithGoogle() {
		isLoading = true;
		const redirect = page.url.searchParams.get('next') || '/';
		await authClient.signIn.social({ provider: 'google', callbackURL: redirect });
		isLoading = false;
	}
</script>

<div class="grid gap-6">
	<form class="space-y-4" onsubmit={onSubmit}>
		<div class="space-y-2">
			<Label for="email">Email Address</Label>
			<div class="relative">
				<Mail class="absolute left-3 top-3 size-4 text-muted-foreground" />
				<Input
					id="email"
					type="email"
					bind:value={email}
					placeholder={`user${orgConfig.mailSuffix}`}
					class="pl-9"
					autocomplete="email"
					disabled={isLoading}
				/>
			</div>
			{#if emailError}
				<p class="text-xs text-destructive">{emailError}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<Label for="password">Password</Label>
				<a
					href="/auth/forgot-password"
					class="text-xs font-medium text-primary hover:underline"
				>
					Forgot password?
				</a>
			</div>
			<div class="relative">
				<Lock class="absolute left-3 top-3 size-4 text-muted-foreground" />
				<Input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					class="pl-9"
					autocomplete="current-password"
					disabled={isLoading}
				/>
			</div>
			{#if passwordError}
				<p class="text-xs text-destructive">{passwordError}</p>
			{/if}
		</div>

		<label class="flex items-center gap-2 text-sm text-muted-foreground">
			<input type="checkbox" bind:checked={rememberMe} class="rounded border-border" />
			Remember me
		</label>

		<Button type="submit" class="w-full" disabled={isLoading}>
			{#if isLoading}
				<Loader2 class="mr-2 size-4 animate-spin" />
			{/if}
			Sign In
		</Button>
	</form>

	<div class="relative">
		<div class="absolute inset-0 flex items-center">
			<span class="w-full border-t border-border/60"></span>
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-card px-2 font-medium text-muted-foreground">Or continue with</span>
		</div>
	</div>

	<Button variant="outline" class="w-full gap-2" disabled={isLoading} onclick={signInWithGoogle}>
		{#if isLoading}
			<Loader2 class="size-4 animate-spin" />
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24">
				<path
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					fill="#4285F4"
				/>
				<path
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					fill="#34A853"
				/>
				<path
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					fill="#FBBC05"
				/>
				<path
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					fill="#EA4335"
				/>
			</svg>
		{/if}
		Google
	</Button>
</div>
