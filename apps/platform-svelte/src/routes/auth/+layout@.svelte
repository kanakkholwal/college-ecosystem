<script lang="ts">
	import ApplicationInfo from '$lib/components/common/application-info.svelte';
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<main class="relative flex min-h-svh items-center justify-center px-4 py-12">
	<div class="absolute inset-0 -z-10 overflow-hidden">
		<div
			class="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
		></div>
		<div
			class="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-tertiary/10 blur-3xl"
		></div>
	</div>

	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<a
				href={resolve('/')}
				class="inline-flex items-center justify-center transition-opacity hover:opacity-80"
			>
				<ApplicationInfo />
			</a>
		</div>

		<div class="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur-sm md:p-8">
			{@render children()}
		</div>

		<p class="mt-6 text-center text-xs text-muted-foreground">
			By continuing you agree to our
			<a href={resolve('/terms')} class="underline hover:text-foreground">Terms</a>
			and
			<a href={resolve('/privacy-policy')} class="underline hover:text-foreground">Privacy Policy</a>.
		</p>
	</div>
</main>
