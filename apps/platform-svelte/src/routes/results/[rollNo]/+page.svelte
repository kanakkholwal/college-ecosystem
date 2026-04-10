<script lang="ts">
	import InView from '$lib/components/animation/in-view.svelte';
	import NumberTicker from '$lib/components/animation/number-ticker.svelte';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { ArrowLeft, Calendar, GraduationCap, Trophy } from 'lucide-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const result = $derived(data.result);
	const latestSemester = $derived(result.semesters.at(-1));
	const latestCgpi = $derived(latestSemester?.cgpi ?? 0);
</script>

<svelte:head>
	<title>{result.name} ({result.rollNo}) - Result Details</title>
	<meta name="description" content={`Semester-wise academic results for ${result.name}, Roll No: ${result.rollNo}, Branch: ${result.branch}`} />
</svelte:head>

<main class="mx-auto w-full max-w-(--max-app-width) space-y-8 px-4 py-10 md:px-6">
	<a
		href="/results"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-4" />
		Back to Results
	</a>

	<!-- Student Info Header -->
	<InView variant="fly-up">
		<Card class="overflow-hidden">
			<CardHeader class="border-b bg-muted/20">
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div class="space-y-2">
						<CardTitle class="text-2xl md:text-3xl">{result.name}</CardTitle>
						<div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
							<span class="rounded bg-muted/60 px-2 py-0.5 font-mono">{result.rollNo}</span>
							<span>•</span>
							<span>{result.branch}</span>
							<span>•</span>
							<span>Batch {result.batch}</span>
							<span>•</span>
							<span>{result.programme}</span>
						</div>
					</div>

					<Badge variant="outline" class="gap-1.5 px-3 py-1 text-sm">
						<Trophy class="size-3.5" />
						Rank #{result.rank.college}
					</Badge>
				</div>
			</CardHeader>

			<CardContent class="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
				<div class="space-y-1">
					<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Current CGPI
					</p>
					<p class="text-3xl font-bold tabular-nums">
						<NumberTicker value={latestCgpi} decimals={2} />
					</p>
				</div>
				<div class="space-y-1">
					<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Semesters
					</p>
					<p class="text-3xl font-bold">{result.semesters.length}</p>
				</div>
				<div class="space-y-1">
					<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Branch Rank
					</p>
					<p class="text-3xl font-bold">#{result.rank.branch}</p>
				</div>
				<div class="space-y-1">
					<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Batch Rank
					</p>
					<p class="text-3xl font-bold">#{result.rank.batch}</p>
				</div>
			</CardContent>
		</Card>
	</InView>

	<!-- Semester-wise breakdown -->
	<section class="space-y-4">
		<div class="flex items-center gap-2">
			<GraduationCap class="size-5 text-primary" />
			<h2 class="text-xl font-semibold tracking-tight">Semester-wise Performance</h2>
		</div>

		<StaggerContainer class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each result.semesters as semester, idx (semester.semester)}
				<Card>
					<CardHeader class="pb-3">
						<div class="flex items-center justify-between">
							<CardTitle class="flex items-center gap-2 text-base">
								<Calendar class="size-4 text-muted-foreground" />
								Semester {semester.semester}
							</CardTitle>
							<Badge variant="secondary" class="tabular-nums">
								SGPI {semester.sgpi?.toFixed(2)}
							</Badge>
						</div>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">CGPI</span>
							<span class="font-mono font-semibold tabular-nums">
								{semester.cgpi?.toFixed(2)}
							</span>
						</div>
						<Separator />
						<div class="space-y-2">
							<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Courses ({semester.courses.length})
							</p>
							<div class="space-y-1.5">
								{#each semester.courses as course (course.code)}
									<div class="flex items-center justify-between gap-2 text-xs">
										<span class="truncate">{course.name}</span>
										<span
											class="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 font-mono font-medium"
										>
											{course.grade}
										</span>
									</div>
								{/each}
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</StaggerContainer>
	</section>
</main>
