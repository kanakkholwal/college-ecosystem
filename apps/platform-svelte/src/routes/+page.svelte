<script lang="ts">
	import type { PageData } from './$types';
	import {
		BookOpen,
		ChartLine,
		Scroll,
		Presentation,
		CalendarCheck,
		Calendar,
		Users,
		Megaphone,
		Vote,
		MessageCircleMore,
		Gift,
		ArrowRight,
		Sparkles
	} from 'lucide-svelte';
	import NumberTicker from '$lib/components/animation/number-ticker.svelte';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import InView from '$lib/components/animation/in-view.svelte';
	import MagicCard from '$lib/components/animation/magic-card.svelte';
	import AnimatedShinyText from '$lib/components/animation/animated-shiny-text.svelte';
	import { appConfig } from '$lib/config/project';

	let { data }: { data: PageData } = $props();

	const iconMap: Record<string, typeof BookOpen> = {
		'/benefits': Gift,
		'/results': ChartLine,
		'/syllabus': Scroll,
		'/classroom-availability': Presentation,
		'/schedules': CalendarCheck,
		'/academic-calendar': Calendar,
		'/community': Users,
		'/announcements': Megaphone,
		'/polls': Vote,
		'/whisper-room': MessageCircleMore
	};

	const greeting = $derived(
		data.userName ? `Welcome back, ${data.userName.split(' ')[0]}` : 'Welcome to the ecosystem'
	);
</script>

<svelte:head>
	<title>{appConfig.name} — Student Portal</title>
	<meta name="description" content={appConfig.description} />
</svelte:head>

<main
	class="mx-auto flex w-full max-w-(--max-app-width) flex-col gap-16 px-4 pt-10 pb-16 md:px-6 md:pt-16 xl:px-12"
>
	<!-- Hero Section -->
	<section class="space-y-6">
		<InView variant="fly-up" duration={700}>
			<div
				class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium"
			>
				<Sparkles class="size-3.5 text-primary" />
				<AnimatedShinyText>Built by students, for students</AnimatedShinyText>
			</div>
		</InView>

		<InView variant="fly-up" duration={700} delay={100}>
			<h1 class="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
				{greeting}
			</h1>
		</InView>

		<InView variant="fly-up" duration={700} delay={200}>
			<p class="max-w-3xl text-base text-muted-foreground md:text-lg">
				Access results, manage attendance, discover campus resources, and connect with your community
				— all in one sleek portal.
			</p>
		</InView>

		<InView variant="fly-up" duration={700} delay={300}>
			<div class="flex flex-wrap items-center gap-3">
				<a
					href="/results"
					class="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
				>
					Check Results
					<ArrowRight class="size-4" />
				</a>
				<a
					href="/community"
					class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
				>
					Join Community
				</a>
			</div>
		</InView>
	</section>

	<!-- Stats Section -->
	<section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<StaggerContainer class="contents">
			<div
				class="relative overflow-hidden rounded-xl border border-border/70 bg-card p-6 shadow-sm"
			>
				<p class="text-sm font-medium text-muted-foreground">Active Sessions</p>
				<p class="mt-2 text-4xl font-bold tracking-tight text-foreground">
					<NumberTicker value={data.publicStats.sessionCount} />
				</p>
			</div>
			<div
				class="relative overflow-hidden rounded-xl border border-border/70 bg-card p-6 shadow-sm"
			>
				<p class="text-sm font-medium text-muted-foreground">Registered Users</p>
				<p class="mt-2 text-4xl font-bold tracking-tight text-foreground">
					<NumberTicker value={data.publicStats.userCount} />
				</p>
			</div>
			<div
				class="relative overflow-hidden rounded-xl border border-border/70 bg-card p-6 shadow-sm"
			>
				<p class="text-sm font-medium text-muted-foreground">Quick Links</p>
				<p class="mt-2 text-4xl font-bold tracking-tight text-foreground">
					<NumberTicker value={data.quickLinks.length} />
				</p>
			</div>
		</StaggerContainer>
	</section>

	<!-- Quick Links -->
	<section class="space-y-6">
		<InView variant="fly-up">
			<div>
				<h2 class="text-2xl font-bold tracking-tight md:text-3xl">Your Ecosystem</h2>
				<p class="mt-1 text-muted-foreground">Quick access to the most used platform routes.</p>
			</div>
		</InView>

		<StaggerContainer class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.quickLinks as link (link.href)}
				{@const Icon = iconMap[link.href] ?? BookOpen}
				<MagicCard class="h-full">
					<a href={link.href} class="group flex h-full flex-col gap-3 p-6">
						<div class="flex items-start justify-between gap-3">
							<div
								class="flex size-11 items-center justify-center rounded-lg border border-border/50 bg-muted/50 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary"
							>
								<Icon class="size-5" />
							</div>
							{#if link.isNew}
								<span
									class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
								>
									New
								</span>
							{/if}
						</div>
						<div class="flex-1">
							<h3 class="font-semibold tracking-tight text-foreground">{link.title}</h3>
							<p class="mt-1 text-sm text-muted-foreground">{link.description}</p>
						</div>
						<div
							class="inline-flex items-center gap-1 text-sm text-muted-foreground transition-all group-hover:gap-2 group-hover:text-primary"
						>
							Explore <ArrowRight class="size-3.5" />
						</div>
					</a>
				</MagicCard>
			{/each}
		</StaggerContainer>
	</section>
</main>
