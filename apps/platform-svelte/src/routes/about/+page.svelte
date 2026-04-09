<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const faqItems = [
		{
			q: 'What is the mission of this project?',
			a: 'To democratize campus technology with a free, open-source ecosystem built for students.'
		},
		{
			q: 'Is student data secure?',
			a: 'Security and privacy are treated as first-class concerns and improved through transparent development.'
		},
		{
			q: 'How can I request a new feature?',
			a: 'Open an issue in the GitHub repository with a clear problem statement and proposed workflow.'
		},
		{
			q: 'Is this officially endorsed?',
			a: 'This is a student-run initiative that operates independently from official institute systems.'
		}
	] as const;

	const techStack = [
		{ name: 'Next.js Core', desc: 'Server-side rendering & app router.' },
		{ name: 'TypeScript', desc: 'Strict type safety across the stack.' },
		{ name: 'Tailwind CSS', desc: 'Atomic, utility-first styling engine.' },
		{ name: 'Postgres & Mongo', desc: 'Hybrid relational & document storage.' }
	] as const;
</script>

<main
	class="mx-auto flex min-h-screen w-full max-w-[var(--max-app-width)] flex-col gap-16 px-4 pt-10 pb-12 md:px-6 xl:px-12"
>
	<section class="relative overflow-hidden rounded-3xl border border-border/50 px-6 py-12 md:px-10">
		<div
			class="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
		></div>
		<div class="mx-auto max-w-4xl space-y-6 text-center">
			<p
				class="mx-auto inline-flex items-center rounded-full border border-border/50 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground"
			>
				v2.0 System Active
			</p>
			<h1 class="text-4xl font-bold tracking-tight text-balance md:text-6xl">
				The Digital Infrastructure for
				<span
					class="bg-gradient-to-l from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% bg-clip-text text-transparent"
				>
					Modern Campuses
				</span>
			</h1>
			<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
				An open-source ecosystem integrating academics, resources, and student utilities into one
				unified operating system.
			</p>
			<div class="flex flex-wrap items-center justify-center gap-3">
				<a
					href="https://github.com/kanakkholwal/college-ecosystem"
					target="_blank"
					rel="noreferrer"
					class="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
				>
					Star on GitHub
				</a>
				<a
					href="https://github.com/kanakkholwal/college-ecosystem/wiki/Introduction"
					target="_blank"
					rel="noreferrer"
					class="rounded-full border border-border/70 px-5 py-2.5 text-sm font-medium hover:bg-muted/40"
				>
					Documentation
				</a>
			</div>

			<div class="grid grid-cols-2 gap-6 border-t border-border/40 pt-8 md:grid-cols-4">
				<div class="space-y-1">
					<p class="text-2xl font-semibold tabular-nums">{data.stats.visitors.toLocaleString()}</p>
					<p class="text-xs tracking-wide text-muted-foreground uppercase">Total Impressions</p>
				</div>
				<div class="space-y-1">
					<p class="text-2xl font-semibold tabular-nums">{data.stats.stars}</p>
					<p class="text-xs tracking-wide text-muted-foreground uppercase">GitHub Stars</p>
				</div>
				<div class="space-y-1">
					<p class="text-2xl font-semibold tabular-nums">{data.stats.contributors}</p>
					<p class="text-xs tracking-wide text-muted-foreground uppercase">Contributors</p>
				</div>
				<div class="space-y-1">
					<p class="text-2xl font-semibold tabular-nums">{data.stats.forks}</p>
					<p class="text-xs tracking-wide text-muted-foreground uppercase">Forks</p>
				</div>
			</div>
		</div>
	</section>

	<section class="space-y-6">
		<div class="space-y-1 text-center">
			<h2 class="text-3xl font-semibold tracking-tight">Core Principles</h2>
			<p class="text-muted-foreground">Built on transparency, utility, and community.</p>
		</div>
		<div class="grid gap-4 md:grid-cols-3">
			<div class="rounded-xl border border-border/60 bg-card p-5 md:col-span-1">
				<h3 class="font-semibold">Open Architecture</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					Complete transparency with auditable and community-improvable code.
				</p>
			</div>
			<div class="rounded-xl border border-border/60 bg-card p-5 md:col-span-2">
				<h3 class="font-semibold">Unified Ecosystem</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					Connecting siloed campus workflows into one seamless experience.
				</p>
			</div>
			<div class="rounded-xl border border-border/60 bg-card p-5 md:col-span-2">
				<h3 class="font-semibold">Community First</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					Built by students to solve real daily campus problems.
				</p>
			</div>
			<div class="rounded-xl border border-border/60 bg-card p-5 md:col-span-1">
				<h3 class="font-semibold">High Performance</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					Optimized architecture focused on speed and reliability.
				</p>
			</div>
		</div>
	</section>

	<section class="rounded-3xl border border-border/50 bg-card/60 p-6 md:p-8">
		<div class="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
			<div class="space-y-1 text-center md:text-left">
				<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Tech Stack</p>
				<h2 class="text-2xl font-semibold tracking-tight">Engineering Excellence</h2>
			</div>
			<a
				href="https://github.com/kanakkholwal/college-ecosystem/wiki/Introduction"
				target="_blank"
				rel="noreferrer"
				class="text-sm font-medium text-primary hover:underline"
			>
				View System Architecture
			</a>
		</div>
		<div class="grid gap-4 sm:grid-cols-2">
			{#each techStack as tech (tech.name)}
				<div class="rounded-xl border border-border/60 bg-background/60 p-5">
					<h3 class="font-semibold">{tech.name}</h3>
					<p class="mt-2 text-sm text-muted-foreground">{tech.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="rounded-3xl border border-border/50 bg-card/60 p-6 md:p-8">
		<div class="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
			<div class="space-y-4">
				<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Community Powered
				</p>
				<h2 class="text-3xl font-semibold tracking-tight">
					Built by {data.stats.contributors}+ maintainers
				</h2>
				<p class="text-muted-foreground">
					Every line of code is transparent, auditable, and crafted by students.
				</p>
				<div class="flex flex-wrap gap-3">
					<a
						href="https://github.com/kanakkholwal/college-ecosystem/blob/main/CONTRIBUTING.md"
						target="_blank"
						rel="noreferrer"
						class="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
					>
						Start Contributing
					</a>
					<a
						href="https://github.com/kanakkholwal/college-ecosystem/graphs/contributors"
						target="_blank"
						rel="noreferrer"
						class="rounded-full border border-border/70 px-5 py-2.5 text-sm font-medium hover:bg-muted/40"
					>
						View All Contributors
					</a>
				</div>
			</div>

			<div class="grid grid-cols-6 gap-2 rounded-2xl border border-border/50 bg-background/70 p-3">
				{#each data.contributors.slice(0, 17) as contributor (contributor.username)}
					<img
						src={contributor.avatar}
						alt={contributor.name}
						class="size-11 rounded-lg border border-border/50 object-cover"
						loading="lazy"
					/>
				{/each}
				<a
					href="https://github.com/kanakkholwal/college-ecosystem/blob/main/CONTRIBUTING.md"
					target="_blank"
					rel="noreferrer"
					class="flex size-11 items-center justify-center rounded-lg border border-dashed border-border/70 text-[10px] font-bold text-muted-foreground"
				>
					+YOU
				</a>
			</div>
		</div>
	</section>

	<section class="mx-auto w-full max-w-3xl space-y-4">
		<h2 class="text-center text-2xl font-semibold">Frequently Asked Questions</h2>
		<div class="space-y-3">
			{#each faqItems as item (item.q)}
				<details class="rounded-xl border border-border/60 bg-card p-4">
					<summary class="cursor-pointer text-sm font-medium text-foreground">{item.q}</summary>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
				</details>
			{/each}
		</div>
	</section>
</main>
