<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import { supportLinks } from '$lib/config/project';
	import { cn } from '$lib/utils';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sheet from '$lib/components/ui/sheet';
	import {
		ExternalLink,
		Home,
		LayoutGrid,
		LogOut,
		ShieldAlert
	} from 'lucide-svelte';

	interface Props {
		user: NonNullable<App.Locals['user']>;
	}

	let { user }: Props = $props();

	let open = $state(false);

	function changeCase(str: string): string {
		return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	async function handleSignOut() {
		await authClient.signOut();
		open = false;
		goto('/auth/sign-in');
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				class="size-9 shrink-0 overflow-hidden rounded-full border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<Avatar class="size-9">
					<AvatarImage src={user.image} alt={user.name} />
					<AvatarFallback>
						{user.name?.charAt(0)?.toUpperCase() ?? '?'}
					</AvatarFallback>
				</Avatar>
			</button>
		{/snippet}
	</Sheet.Trigger>

	<Sheet.Content side="right" class="flex flex-col overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title class="sr-only">Profile</Sheet.Title>
		</Sheet.Header>

		<!-- User Info -->
		<div class="flex flex-col items-center gap-3 px-4 pb-2">
			<Avatar class="size-16">
				<AvatarImage src={user.image} alt={user.name} />
				<AvatarFallback class="text-lg">
					{user.name?.charAt(0)?.toUpperCase() ?? '?'}
				</AvatarFallback>
			</Avatar>
			<div class="flex flex-col items-center gap-1 text-center">
				<p class="text-base font-semibold leading-tight">{user.name}</p>
				<p class="text-sm text-muted-foreground">{user.email}</p>
				<a
					href={resolve(`/results/${user.username}`)}
					class="text-sm text-primary underline-offset-4 hover:underline"
				>
					@{user.username}
				</a>
				{#if user.department}
					<Badge variant="secondary" class="mt-1">{user.department}</Badge>
				{/if}
			</div>
		</div>

		<Separator />

		<!-- Workspaces -->
		{#if user.other_roles && user.other_roles.length > 0}
			<div class="px-4 py-2">
				<p class="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Workspaces
				</p>
				<div class="grid grid-cols-2 gap-2">
					{#each user.other_roles as role (role)}
						{@const isAdmin = role === 'admin'}
						<a
							href={resolve(`/${role}`)}
							class={cn(
								'flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
								isAdmin && 'border-red-500/30 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
							)}
							onclick={() => (open = false)}
						>
							{#if isAdmin}
								<ShieldAlert class="size-4" />
							{:else}
								<LayoutGrid class="size-4" />
							{/if}
							<span>{changeCase(role)}</span>
						</a>
					{/each}
				</div>
			</div>

			<Separator />
		{/if}

		<!-- Shortcuts -->
		<div class="px-4 py-2">
			<p class="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
				Shortcuts
			</p>
			<div class="flex flex-col gap-1">
				{#each supportLinks as link (link.href)}
					<a
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
					>
						<span>{link.title}</span>
						<ExternalLink class="size-3.5" />
					</a>
				{/each}
			</div>
		</div>

		<!-- Footer -->
		<div class="mt-auto border-t p-4">
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					class="flex-1"
					href={resolve('/')}
					onclick={() => (open = false)}
				>
					<Home class="size-4" />
					Home
				</Button>
				<Button
					variant="destructive"
					class="flex-1"
					onclick={handleSignOut}
				>
					<LogOut class="size-4" />
					Sign Out
				</Button>
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
