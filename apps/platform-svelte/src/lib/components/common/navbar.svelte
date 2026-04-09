<script lang="ts">
	import { resolve } from '$app/paths';
	import { navLinks } from '$lib/config/project';
	import { Search } from 'lucide-svelte';
	import ApplicationInfo from './application-info.svelte';
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
			<a
				href={resolve('/auth/sign-in')}
				class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
			>
				Log In
			</a>
		</div>
	</div>
</header>
