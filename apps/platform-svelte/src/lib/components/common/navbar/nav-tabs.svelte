<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import type { ComponentType } from 'svelte';

	// ─── Types ─────────────────────────────────────────────────────────────────

	export interface NavTabLink {
		href: string;
		title: string;
		Icon?: ComponentType;
		isNew?: boolean;
		items?: { href: string; title: string }[];
	}

	// ─── Props ─────────────────────────────────────────────────────────────────

	interface Props {
		navLinks: NavTabLink[];
	}

	let { navLinks }: Props = $props();

	// ─── Active state ──────────────────────────────────────────────────────────

	function isActive(href: string): boolean {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}

	// ─── Dropdown ──────────────────────────────────────────────────────────────

	let openDropdown = $state<string | null>(null);

	function toggleDropdown(href: string) {
		openDropdown = openDropdown === href ? null : href;
	}
</script>

<svelte:window onclick={() => (openDropdown = null)} />

<nav
	aria-label="Primary navigation"
	class="flex items-center gap-0.5 overflow-x-auto no-scrollbar"
>
	{#each navLinks as tab (tab.href)}
		{#if tab.items && tab.items.length > 0}
			<!-- Dropdown tab -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="relative"
				onkeydown={(e) => e.key === 'Escape' && (openDropdown = null)}
			>
				<button
					type="button"
					aria-haspopup="true"
					aria-expanded={openDropdown === tab.href}
					onclick={(e) =>{
                        e.stopPropagation()
                        toggleDropdown(tab.href)
                    }}
					class={cn(
						'relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap select-none',
						'rounded-t-md transition-colors',
						isActive(tab.href)
							? 'text-foreground'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					{#if tab.Icon}
						<tab.Icon class="size-3.5 opacity-70" />
					{/if}
					{tab.title}
					{#if tab.isNew}
						<span class="inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
							New
						</span>
					{/if}
					<svg
						class={cn('size-3 transition-transform duration-200', openDropdown === tab.href && 'rotate-180')}
						viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"
					>
						<path d="M2 4l4 4 4-4" />
					</svg>

					{#if isActive(tab.href)}
						<span class="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
					{/if}
				</button>

				{#if openDropdown === tab.href}
					<div
						role="menu"
						class="absolute top-full left-0 z-50 mt-1 min-w-40 rounded-lg border border-border/60 bg-popover shadow-lg py-1"
					>
						{#each tab.items as item (item.href)}
							<a
								href={item.href}
								role="menuitem"
								onclick={() => (openDropdown = null)}
								class={cn(
									'flex items-center px-3 py-2 text-sm transition-colors',
									isActive(item.href)
										? 'text-primary bg-primary/5'
										: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
								)}
							>
								{item.title}
							</a>
						{/each}
					</div>
				{/if}
			</div>

		{:else}
			<!-- Regular tab -->
			<a
				href={tab.href}
				aria-current={isActive(tab.href) ? 'page' : undefined}
				class={cn(
					'relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap select-none',
					'rounded-t-md transition-colors',
					isActive(tab.href)
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				{#if tab.Icon}
					<tab.Icon class="size-3.5 opacity-70" />
				{/if}
				{tab.title}
				{#if tab.isNew}
					<span class="inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
						New
					</span>
				{/if}

				{#if isActive(tab.href)}
					<span class="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
				{/if}
			</a>
		{/if}
	{/each}
</nav>