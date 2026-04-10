<script lang="ts">
	import type { PageData } from './$types';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import InView from '$lib/components/animation/in-view.svelte';
	import EmptyArea from '$lib/components/common/empty-area.svelte';
	import { CalendarRange, GraduationCap, Layers, LayoutGrid } from 'lucide-svelte';
	import { getDepartmentShort } from '$lib/constants/core.departments';

	let { data }: { data: PageData } = $props();
	const timeTables = $derived(data.timeTables);
</script>

<svelte:head>
	<title>Timetables | College Platform</title>
	<meta
		name="description"
		content="Browse and access academic schedules across departments."
	/>
</svelte:head>

<main class="relative min-h-screen pb-20">
	<div
		class="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
	></div>

	<InView variant="fly-up">
		<section
			class="mx-auto flex max-w-(--max-app-width) flex-col items-center gap-4 px-4 pb-12 pt-20 text-center md:px-6"
		>
			<Badge
				variant="outline"
				class="rounded-full border-primary/20 bg-primary/5 px-4 py-1 text-xs font-medium uppercase tracking-wider text-primary"
			>
				<CalendarRange class="mr-2 size-3" /> Academic Schedule
			</Badge>
			<h1 class="text-4xl font-bold tracking-tight md:text-5xl">
				Find Your <span class="text-primary">Timetable</span>
			</h1>
			<p class="max-w-2xl text-sm text-muted-foreground md:text-base">
				Access the latest academic schedules. Filter by department, year, or semester to find your
				section.
			</p>
		</section>
	</InView>

	<div class="mx-auto max-w-7xl px-4 md:px-6">
		<div class="flex items-center justify-between py-6">
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<LayoutGrid class="size-4" />
				<span>
					Viewing <strong>{timeTables.length}</strong> active schedules
				</span>
			</div>
			<Separator class="ml-4 mr-2 max-w-25 flex-1 opacity-50" />
		</div>

		{#if timeTables.length === 0}
			<div class="rounded-xl border border-dashed bg-muted/20 py-20">
				<EmptyArea
					title="No Timetables Found"
					description="There are no active timetables matching your criteria at the moment."
				/>
			</div>
		{:else}
			<StaggerContainer
				class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				{#each timeTables as timetable (timetable._id)}
					{@const deptShort = getDepartmentShort(timetable.department_code as string)}
					<a
						href={`/schedules/${timetable.department_code}/${timetable.year}/${timetable.semester}`}
						class="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
					>
						<div class="mb-4 flex items-start justify-between">
							<Badge
								variant="secondary"
								class="bg-muted font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
							>
								{deptShort || timetable.department_code}
							</Badge>

							<div
								class="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm transition-all group-hover:border-primary/30 group-hover:text-primary"
							>
								<CalendarRange class="size-4" />
							</div>
						</div>

						<div class="mb-6">
							<h3
								class="line-clamp-1 text-lg font-bold text-foreground transition-colors group-hover:text-primary"
							>
								{timetable.sectionName}
							</h3>
							<p class="mt-1 text-xs text-muted-foreground">
								{timetable.department_code} Department
							</p>
						</div>

						<div class="mt-auto grid grid-cols-2 gap-2">
							<div
								class="flex items-center gap-2 rounded-md border border-transparent bg-muted/40 px-2 py-1.5 transition-colors group-hover:border-border/50"
							>
								<GraduationCap class="size-3.5 text-muted-foreground" />
								<span class="text-xs font-medium">Year {timetable.year}</span>
							</div>
							<div
								class="flex items-center gap-2 rounded-md border border-transparent bg-muted/40 px-2 py-1.5 transition-colors group-hover:border-border/50"
							>
								<Layers class="size-3.5 text-muted-foreground" />
								<span class="text-xs font-medium">Sem {timetable.semester}</span>
							</div>
						</div>
					</a>
				{/each}
			</StaggerContainer>
		{/if}
	</div>
</main>
