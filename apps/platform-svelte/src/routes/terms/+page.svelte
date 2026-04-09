<script lang="ts">
	const clauses = [
		{ id: 'acceptance', title: '1. Acceptance of Terms' },
		{ id: 'unofficial', title: '2. Unofficial Platform' },
		{ id: 'usage', title: '3. Use of Services' },
		{ id: 'accuracy', title: '4. No Accuracy Guarantee' },
		{ id: 'liability', title: '5. Limitation of Liability' },
		{ id: 'contact', title: '6. Contact' }
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
			Legal Agreements
		</p>
		<h1 class="text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
		<p class="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
		<p class="text-muted-foreground">
			By accessing this platform, you agree to the following terms and responsibilities.
		</p>
	</header>

	<div class="grid gap-8 lg:grid-cols-[240px_1fr]">
		<nav class="hidden lg:block">
			<div class="sticky top-20 rounded-xl border border-border/70 bg-card p-4">
				<p class="mb-3 text-sm font-semibold">Clauses</p>
				<ul class="space-y-2 text-sm text-muted-foreground">
					{#each clauses as clause (clause.id)}
						<li>
							<a class="hover:text-foreground" href={`#${clause.id}`}>{clause.title}</a>
						</li>
					{/each}
				</ul>
			</div>
		</nav>

		<article class="space-y-8 rounded-xl border border-border/70 bg-card p-6">
			<section class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
				<h2 class="font-semibold">Unofficial platform disclaimer</h2>
				<p class="mt-2 text-sm text-muted-foreground">
					This is a student-run initiative and is not affiliated with or endorsed by National
					Institute of Technology, Hamirpur.
				</p>
			</section>

			<section id="acceptance" class="space-y-2">
				<h2 class="text-xl font-semibold">1. Acceptance of Terms</h2>
				<p class="text-sm text-muted-foreground">
					Using this site means you accept these terms, along with applicable privacy and policy
					documents.
				</p>
			</section>

			<section id="unofficial" class="space-y-2">
				<h2 class="text-xl font-semibold">2. Unofficial Platform</h2>
				<p class="text-sm text-muted-foreground">
					Any mention of institute names, logos, or resources is for informational purposes only.
				</p>
			</section>

			<section id="usage" class="space-y-2">
				<h2 class="text-xl font-semibold">3. Use of Services</h2>
				<ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
					<li>No misuse, disruption, or unauthorized access attempts.</li>
					<li>No unlawful or infringing uploads/content.</li>
					<li>Users remain responsible for submitted content.</li>
				</ul>
			</section>

			<section id="accuracy" class="space-y-2">
				<h2 class="text-xl font-semibold">4. No Accuracy Guarantee</h2>
				<p class="text-sm text-muted-foreground">
					Academic and operational data is provided as-is and must be verified with official
					sources.
				</p>
			</section>

			<section id="liability" class="space-y-2">
				<h2 class="text-xl font-semibold">5. Limitation of Liability</h2>
				<p class="text-sm text-muted-foreground">
					To the fullest extent permitted by law, platform contributors are not liable for indirect
					or consequential damages arising from use of the service.
				</p>
			</section>

			<section id="contact" class="space-y-2">
				<h2 class="text-xl font-semibold">6. Contact</h2>
				<a class="text-primary hover:underline" href="mailto:contact@nith.eu.org">
					contact@nith.eu.org
				</a>
			</section>
		</article>
	</div>
</main>
