<script lang="ts">
	import { resolve } from '$app/paths';
	import { navLinks } from '$lib/config/project';
	import { Search, Menu } from 'lucide-svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import ApplicationInfo from './application-info.svelte';
	import ProfileDropdown from './profile-dropdown.svelte';
	import ThemeSwitcher from './theme-switcher.svelte';

	interface Props {
		user?: App.Locals['user'];
	}

	let { user = null }: Props = $props();

	let mobileMenuOpen = $state(false);
</script>

<header
	id="navbar"
	class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl"
>
	<div class="mx-auto flex h-16 w-full max-w-(--max-app-width) items-center gap-4 px-4">
		<a href={resolve('/')} class="transition-opacity hover:opacity-80">
			<ApplicationInfo />
		</a>

		<nav class="ml-6 hidden items-center gap-1 md:flex">
			{#each navLinks as link (link.href)}
				<a
					href={resolve(link.href)}
					class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					{link.title}
				</a>
			{/each}
		</nav>

		<div class="ml-auto flex items-center gap-2">
			<button
				type="button"
				class="hidden items-center gap-2 rounded-md border border-border/70 bg-card px-3 py-2 text-sm text-muted-foreground md:flex"
			>
				<Search class="size-4" />
				<span>Search</span>
			</button>

			<ThemeSwitcher />

			{#if user}
				<ProfileDropdown {user} />
			{:else}
				<a
					href={resolve('/auth/sign-in')}
					class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
				>
					Log In
				</a>
			{/if}

			<!-- Mobile menu button -->
			<Sheet.Root bind:open={mobileMenuOpen}>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button variant="ghost" size="icon" class="md:hidden" {...props}>
							<Menu class="size-5" />
							<span class="sr-only">Open menu</span>
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content side="left" class="w-72">
					<Sheet.Header>
						<Sheet.Title>
							<ApplicationInfo />
						</Sheet.Title>
					</Sheet.Header>
					<nav class="flex flex-col gap-1 px-4 py-2">
						{#each navLinks as link (link.href)}
							<a
								href={resolve(link.href)}
								class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
								onclick={() => (mobileMenuOpen = false)}
							>
								{link.title}
							</a>
						{/each}
					</nav>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</header>
