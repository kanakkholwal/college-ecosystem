<script lang="ts">
	import { resolve } from '$app/paths';
	import { Home } from 'lucide-svelte';

	const goBack = () => {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back();
			return;
		}
		window.location.assign(resolve('/'));
	};
</script>

<main
	class="mx-auto flex min-h-screen w-full max-w-[var(--max-app-width)] flex-col items-center justify-center gap-5 px-4 py-16 text-center md:px-6 xl:px-12"
>
	<h1 class="text-4xl font-bold tracking-tight md:text-5xl">Stop right there!</h1>
	<p class="max-w-2xl text-muted-foreground">
		You are not authorized to view this page. Please sign in with an authorized account to access
		this page.
	</p>

	<div
		class="mx-auto my-2 flex h-64 w-full max-w-xl items-center justify-center rounded-2xl border border-border/60 bg-card text-muted-foreground"
	>
		<span class="text-lg font-medium">403 • Not Authorized</span>
	</div>

	<div class="flex flex-wrap items-center justify-center gap-3">
		<button
			type="button"
			onclick={goBack}
			class="rounded-full border border-border/70 bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted/30"
		>
			Go Back
		</button>
		<a
			href={resolve('/')}
			class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
		>
			<Home class="size-4" />
			Go to Home
		</a>
	</div>
</main>
