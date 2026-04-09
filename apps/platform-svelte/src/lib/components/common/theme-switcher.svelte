<script lang="ts">
	import { setMode, userPrefersMode } from 'mode-watcher';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Sun, Moon, Monitor, Check } from 'lucide-svelte';

	const userPreference = $derived(userPrefersMode.current);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="ghost" size="icon" {...props}>
				<Sun
					class="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Moon
					class="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-36">
		<DropdownMenu.Item onclick={() => setMode('system')}>
			<Monitor class="mr-2 size-4" />
			<span>System</span>
			{#if userPreference === 'system'}
				<Check class="ml-auto size-4" />
			{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setMode('light')}>
			<Sun class="mr-2 size-4" />
			<span>Light</span>
			{#if userPreference === 'light'}
				<Check class="ml-auto size-4" />
			{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setMode('dark')}>
			<Moon class="mr-2 size-4" />
			<span>Dark</span>
			{#if userPreference === 'dark'}
				<Check class="ml-auto size-4" />
			{/if}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
