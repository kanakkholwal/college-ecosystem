<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/common/footer.svelte';
	import GithubBanner from '$lib/components/common/github-banner.svelte';
	import Navbar from '$lib/components/common/navbar.svelte';
	import './layout.css';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative z-0 flex min-h-svh min-w-full flex-1 flex-col">
	<Navbar user={data.user} />
	<main
		class="relative z-10 mx-auto flex min-h-screen w-full max-w-(--max-app-width) flex-1 flex-col"
	>
		{@render children()}
		<GithubBanner />
	</main>

	<div class="pointer-events-none absolute inset-0 -z-10">
		<div
			class="absolute -top-32 -left-32 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl"
		></div>
		<div
			class="absolute right-0 bottom-0 h-[28rem] w-[28rem] animate-pulse rounded-full bg-tertiary/20 blur-3xl [animation-delay:700ms]"
		></div>
	</div>

	<Footer />
</div>
