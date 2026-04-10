<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  import { Button } from '$lib/components/ui/button';
  import * as Command from '$lib/components/ui/command';
  import * as Dialog from '$lib/components/ui/dialog';

  import { LogIn, Search, User } from 'lucide-svelte';

  import ProfileDropdown from '$lib/components/common/profile-dropdown.svelte';
  import ThemePopover from '$lib/components/common/theme-popover.svelte';
  import ThemeSwitcher from '$lib/components/common/theme-switcher.svelte';
  import { getNavLinks } from '$utils/nav';
  import Icon from '@iconify/svelte';
  import NavTabs from './nav-tabs.svelte';


  let { user, logo = null } = $props();

  let open = $state(false);
  let search = $state('');
  let activeCategory = $state('all');

  let navLinks = $derived(getNavLinks(user));

  let categories =  $derived([
    'all',
    ...new Set(navLinks.map((l) => l.category).filter(Boolean))
  ]);

  let filteredLinks = $derived(
    activeCategory === 'all'
      ? navLinks
      : navLinks.filter((l) => l.category === activeCategory)
  );

  let filteredSearch = $derived(	
    search.length === 0
      ? navLinks
      : navLinks.filter((l) =>
          `${l.title} ${l.description ?? ''} ${l.category ?? ''}`
            .toLowerCase()
            .includes(search.toLowerCase())
        ))

  const navigate = (href: string) => {
    open = false;
    goto(href);
  };

  // Cmd + K
  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open = !open;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });
</script>

<header class="z-50 w-full border-b border-border/40 bg-background/40 backdrop-blur-xl">
	<div class="mx-auto flex h-16 max-w-[--max-app-width] items-center justify-between px-4 py-3">
		<!-- Brand -->
		<a href="/" class="flex items-center gap-2 hover:opacity-80">
			{#if logo}
				{@render logo()}
			{/if}
		</a>

		<!-- Actions -->
		<div class="flex items-center gap-3">
			<!-- Search Trigger -->
			<Button
				variant="outline"
				class="hidden w-56 justify-start text-muted-foreground md:flex"
				onclick={() => (open = true)}
			>
				<Search class="mr-2 size-4" />
				Search...
				<span class="ml-auto text-xs opacity-60">⌘K</span>
			</Button>

			<ThemeSwitcher />
			<ThemePopover />

			{#if user}
				<ProfileDropdown {user} />
			{:else}
				<Button onclick={() => goto('/auth/sign-in')}>
					<LogIn class="mr-2 size-4" />
					Log In
				</Button>
			{/if}
		</div>
	</div>

	<!-- Categories -->
	{#if categories.length > 1}
		<div class="flex gap-2 overflow-x-auto px-4">
			{#each categories as category}
				<Button
					size="sm"
					variant={activeCategory === category ? 'default' : 'ghost'}
					onclick={() => (activeCategory = category)}
					class="capitalize"
				>
					{category}
				</Button>
			{/each}
		</div>
	{/if}

	<!-- Tabs -->
	<div class="px-4 py-2">
		<NavTabs navLinks={filteredLinks} />
	</div>
</header>

<!-- ✅ shadcn Command Dialog -->
<Dialog.Root bind:open>
	<Dialog.Content class="overflow-hidden p-0">
		<Command.Root>
			<Command.Input bind:value={search} placeholder="Search ecosystem..." />

			<Command.List>
				<Command.Empty>No results found.</Command.Empty>

				<!-- Pages -->
				<Command.Group heading="Pages">
					{#each filteredSearch as item}
						<Command.Item value={item.title} onSelect={() => navigate(item.href)}>
							{#if item.icon}
								<Icon icon={item.icon} class="mr-2 size-4" />
							{/if}

							<div class="flex flex-col">
								<span>{item.title}</span>
								{#if item.description}
									<span class="text-xs text-muted-foreground">
										{item.description}
									</span>
								{/if}
							</div>
						</Command.Item>
					{/each}
				</Command.Group>

				<!-- Auth / Account -->
				<Command.Group heading="Account">
					{#if user}
						<Command.Item onSelect={() => navigate(`/u/${user.username}`)}>
							<User class="mr-2 size-4" />
							Profile
						</Command.Item>
					{:else}
						<Command.Item onSelect={() => navigate('/auth/sign-in')}>
							<LogIn class="mr-2 size-4" />
							Sign In
						</Command.Item>
					{/if}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Dialog.Content>
</Dialog.Root>
