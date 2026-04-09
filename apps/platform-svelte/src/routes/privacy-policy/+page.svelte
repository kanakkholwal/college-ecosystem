<script lang="ts">
	const sections = [
		{ id: 'intro', title: 'Introduction' },
		{ id: 'collection', title: 'Information We Collect' },
		{ id: 'usage', title: 'How We Use Information' },
		{ id: 'cookies', title: 'Cookies & Ads' },
		{ id: 'rights', title: 'Your Rights' },
		{ id: 'security', title: 'Security & Retention' },
		{ id: 'contact', title: 'Contact' }
	];

	const lastUpdated = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<main class="mx-auto min-h-screen w-full max-w-6xl px-4 pt-8 pb-10 md:px-6 xl:px-12">
	<header class="mb-10 max-w-3xl space-y-3">
		<p
			class="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
		>
			Legal Documentation
		</p>
		<h1 class="text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
		<p class="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
		<p class="text-muted-foreground">
			This page explains how data may be collected, used, and protected when using this platform.
		</p>
	</header>

	<div class="grid gap-8 lg:grid-cols-[240px_1fr]">
		<nav class="hidden lg:block">
			<div class="sticky top-20 rounded-xl border border-border/70 bg-card p-4">
				<p class="mb-3 text-sm font-semibold">On this page</p>
				<ul class="space-y-2 text-sm text-muted-foreground">
					{#each sections as section (section.id)}
						<li>
							<a class="hover:text-foreground" href={`#${section.id}`}>{section.title}</a>
						</li>
					{/each}
				</ul>
			</div>
		</nav>

		<article class="space-y-8 rounded-xl border border-border/70 bg-card p-6">
			<section id="intro" class="space-y-2">
				<h2 class="text-xl font-semibold">Who We Are</h2>
				<p class="text-sm text-muted-foreground">
					A student-run project for the NIT Hamirpur community. Contact us at
					<a class="text-primary hover:underline" href="mailto:contact@nith.eu.org"
						>contact@nith.eu.org</a
					>.
				</p>
			</section>

			<section id="collection" class="space-y-2">
				<h2 class="text-xl font-semibold">Information We Collect</h2>
				<ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
					<li>Usage and device-level metadata for operations and debugging.</li>
					<li>Cookies/local storage for session and preference continuity.</li>
					<li>Optional account/profile content submitted by users.</li>
				</ul>
			</section>

			<section id="usage" class="space-y-2">
				<h2 class="text-xl font-semibold">How We Use Information</h2>
				<ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
					<li>Operate and improve platform features.</li>
					<li>Prevent abuse and maintain platform security.</li>
					<li>Measure product usage and reliability.</li>
				</ul>
			</section>

			<section id="cookies" class="space-y-2">
				<h2 class="text-xl font-semibold">Cookies & Ads</h2>
				<p class="text-sm text-muted-foreground">
					Third-party services may use cookies for analytics or ad personalization. You can manage
					personalized ads through
					<a
						class="text-primary hover:underline"
						href="https://adssettings.google.com"
						target="_blank"
						rel="noreferrer"
					>
						Google Ads Settings
					</a>.
				</p>
			</section>

			<section id="rights" class="space-y-2">
				<h2 class="text-xl font-semibold">Your Rights</h2>
				<p class="text-sm text-muted-foreground">
					You may request access, correction, or deletion of your data where applicable.
				</p>
			</section>

			<section id="security" class="space-y-2">
				<h2 class="text-xl font-semibold">Security & Retention</h2>
				<p class="text-sm text-muted-foreground">
					Reasonable security measures are used, but no online system is fully risk-free.
				</p>
			</section>

			<section id="contact" class="space-y-2">
				<h2 class="text-xl font-semibold">Contact</h2>
				<a
					href="mailto:contact@nith.eu.org"
					class="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
				>
					Email contact@nith.eu.org
				</a>
			</section>
		</article>
	</div>
</main>
