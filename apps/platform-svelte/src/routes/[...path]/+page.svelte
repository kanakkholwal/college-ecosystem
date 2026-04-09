<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main
	class="mx-auto flex min-h-screen w-full max-w-(--max-app-width) flex-col gap-6 px-4 pt-8 pb-10 md:px-6 xl:px-12"
>
	<p
		class="inline-flex w-fit rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium"
	>
		Phase 4 route parity
	</p>

	<section class="space-y-3 rounded-xl border border-border/70 bg-card p-6">
		<h1 class="text-2xl font-semibold tracking-tight md:text-3xl">
			Route migrated with matching path
		</h1>
		<p class="text-muted-foreground">
			This URL is preserved from the Next.js app during migration and is now served in SvelteKit.
		</p>
		<div class="rounded-md border border-border/70 bg-muted/20 px-3 py-2 font-mono text-sm">
			{data.routePath}
		</div>
	</section>

	<div class="flex flex-wrap gap-3">
		<a
			href={resolve('/')}
			class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
		>
			Go to Home
		</a>
		<a
			href={resolve('/resources')}
			class="rounded-md border border-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
		>
			Open Resources
		</a>
	</div>
</main>
