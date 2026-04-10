<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Loader2, Lock, Mail, User } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { authClient } from '$lib/auth-client';
	import { orgConfig } from '$lib/config/project';
	import { getDepartmentName } from '$lib/constants/core.departments';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let nameError = $state<string | null>(null);
	let emailError = $state<string | null>(null);
	let passwordError = $state<string | null>(null);

	function validate(): boolean {
		nameError = null;
		emailError = null;
		passwordError = null;

		if (name.length < 2) {
			nameError = 'Name must be at least 2 characters';
			return false;
		}
		if (!email.includes('@')) {
			emailError = 'Invalid email address';
			return false;
		}
		if (!email.endsWith(orgConfig.mailSuffix)) {
			emailError = `Must use organization email (${orgConfig.mailSuffix})`;
			return false;
		}
		if (password.length < 8) {
			passwordError = 'Password must be at least 8 characters';
			return false;
		}
		if (!/[A-Z]/.test(password)) {
			passwordError = 'Must contain an uppercase letter';
			return false;
		}
		if (!/[0-9]/.test(password)) {
			passwordError = 'Must contain a number';
			return false;
		}
		return true;
	}

	async function onSubmit(e: Event) {
		e.preventDefault();
		if (!validate()) return;

		if (email.startsWith('25')) {
			toast.error('Batch 2025: Please use Google Sign In.');
			return;
		}

		const redirect = page.url.searchParams.get('next') || '/';
		isLoading = true;

		await authClient.signUp.email(
			{
				email,
				password,
				name,
				callbackURL: redirect,
				username: email.split('@')[0],
				department: getDepartmentName('ece'),
				other_roles: ['student']
			},
			{
				onRequest: () => {
					isLoading = true;
				},
				onResponse: () => {
					isLoading = false;
				},
				onSuccess: () => {
					toast.success('Account created! Please verify your email.');
					goto('/auth/verify-mail');
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				}
			}
		);
	}

	async function signUpWithGoogle() {
		isLoading = true;
		const redirect = page.url.searchParams.get('next') || '/';
		await authClient.signIn.social({ provider: 'google', callbackURL: redirect });
		isLoading = false;
	}
</script>

<div class="grid gap-6">
	<form class="space-y-4" onsubmit={onSubmit}>
		<div class="space-y-2">
			<Label for="name">Full Name</Label>
			<div class="relative">
				<User class="absolute left-3 top-3 size-4 text-muted-foreground" />
				<Input
					id="name"
					bind:value={name}
					placeholder="John Doe"
					class="pl-9"
					autocomplete="name"
					disabled={isLoading}
				/>
			</div>
			{#if nameError}
				<p class="text-xs text-destructive">{nameError}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="signup-email">Email Address</Label>
			<div class="relative">
				<Mail class="absolute left-3 top-3 size-4 text-muted-foreground" />
				<Input
					id="signup-email"
					type="email"
					bind:value={email}
					placeholder={`user${orgConfig.mailSuffix}`}
					class="pl-9"
					autocomplete="email"
					disabled={isLoading}
				/>
			</div>
			<p class="pt-1 text-[10px] font-medium text-muted-foreground/80">
				Only {orgConfig.mailSuffix} emails are allowed.
			</p>
			{#if emailError}
				<p class="text-xs text-destructive">{emailError}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="signup-password">Password</Label>
			<div class="relative">
				<Lock class="absolute left-3 top-3 size-4 text-muted-foreground" />
				<Input
					id="signup-password"
					type="password"
					bind:value={password}
					placeholder="Create a password"
					class="pl-9"
					autocomplete="new-password"
					disabled={isLoading}
				/>
			</div>
			{#if passwordError}
				<p class="text-xs text-destructive">{passwordError}</p>
			{/if}
		</div>

		<Button type="submit" class="w-full" disabled={isLoading}>
			{#if isLoading}
				<Loader2 class="mr-2 size-4 animate-spin" />
			{/if}
			Create Account
		</Button>
	</form>

	<div class="relative">
		<div class="absolute inset-0 flex items-center">
			<span class="w-full border-t border-border/60"></span>
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-card px-2 font-medium text-muted-foreground">Or sign up with</span>
		</div>
	</div>

	<Button variant="outline" class="w-full gap-2" disabled={isLoading} onclick={signUpWithGoogle}>
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
