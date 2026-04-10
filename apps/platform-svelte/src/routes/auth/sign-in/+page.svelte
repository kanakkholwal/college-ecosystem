<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import SignInForm from './sign-in-form.svelte';
	import SignUpForm from './sign-up-form.svelte';
	import { page } from '$app/state';

	const tabParam = $derived(page.url.searchParams.get('tab'));
	const defaultTab = $derived(tabParam === 'sign-up' ? 'sign-up' : 'sign-in');
</script>

<svelte:head>
	<title>Sign In | College Platform</title>
	<meta name="description" content="Sign in or create an account to access the ecosystem." />
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col space-y-2 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">
			{defaultTab === 'sign-up' ? 'Create an account' : 'Welcome back'}
		</h1>
		<p class="text-sm text-muted-foreground">
			{defaultTab === 'sign-up'
				? 'Enter your details to get started with the ecosystem.'
				: 'Enter your credentials to access your dashboard.'}
		</p>
	</div>

	<Tabs.Root value={defaultTab} class="w-full">
		<Tabs.List class="mb-6 grid w-full grid-cols-2">
			<Tabs.Trigger value="sign-in">Sign In</Tabs.Trigger>
			<Tabs.Trigger value="sign-up">Create Account</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="sign-in" class="mt-0">
			<SignInForm />
		</Tabs.Content>

		<Tabs.Content value="sign-up" class="mt-0">
			<SignUpForm />
		</Tabs.Content>
	</Tabs.Root>
</div>
