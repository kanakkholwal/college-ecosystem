<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const greeting = $derived(
		data.userName ? `Welcome back, ${data.userName}` : 'Welcome to the ecosystem'
	);
</script>

<main
	class="mx-auto flex min-h-screen w-full max-w-(--max-app-width) flex-col gap-10 px-4 pt-6 pb-10 md:px-6 xl:px-12"
>
	<section class="space-y-4">
		<p
			class="inline-flex rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium"
		>
			Phase 4 migration started
		</p>
		<h1 class="text-3xl font-semibold tracking-tight lg:text-5xl">{greeting}</h1>
		<p class="max-w-3xl text-base text-muted-foreground lg:text-lg">
			Access results, manage attendance, discover resources, and connect with your campus community.
		</p>
	</section>

	<section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<div class="rounded-xl border border-border/80 bg-card p-5">
			<p class="text-sm text-muted-foreground">Active Sessions</p>
			<p class="mt-1 text-3xl font-semibold text-foreground">{data.publicStats.sessionCount}</p>
		</div>
		<div class="rounded-xl border border-border/80 bg-card p-5">
			<p class="text-sm text-muted-foreground">Registered Users</p>
			<p class="mt-1 text-3xl font-semibold text-foreground">{data.publicStats.userCount}</p>
		</div>
	</section>

	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold tracking-tight">Your Ecosystem</h2>
			<p class="text-muted-foreground">Quick access to the most used platform routes.</p>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.quickLinks as link (link.href)}
				<a
					href={link.href}
					class="group rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/20"
				>
					<div class="flex items-start justify-between gap-3">
						<h3 class="text-lg font-medium text-foreground">{link.title}</h3>
						{#if link.isNew}
							<span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
								>New</span
							>
						{/if}
					</div>
					<p class="mt-2 text-sm text-muted-foreground">{link.description}</p>
				</a>
			{/each}
		</div>
	</section>
</main>
