<script lang="ts">
	import type { PageData } from './$types';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import InView from '$lib/components/animation/in-view.svelte';
	import { ArrowLeft, CalendarRange, Clock } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	const timetable = $derived(data.timetable);

	// Group schedule by day if the schedule is an array of entries
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const schedule = $derived((timetable.schedule as any) ?? []);
</script>

<svelte:head>
	<title>{timetable.sectionName} - Schedule</title>
</svelte:head>

<main class="mx-auto w-full max-w-(--max-app-width) space-y-6 px-4 py-10 md:px-6">
	<a
		href="/schedules"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-4" />
		Back to Schedules
	</a>

	<InView variant="fly-up">
		<Card>
			<CardHeader class="border-b bg-muted/20">
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div>
						<Badge variant="secondary" class="mb-2 font-mono text-[10px] uppercase tracking-wider">
							{timetable.department_code}
						</Badge>
						<CardTitle class="text-2xl md:text-3xl">{timetable.sectionName}</CardTitle>
						<p class="mt-1 text-sm text-muted-foreground">
							Year {timetable.year} • Semester {timetable.semester}
						</p>
					</div>
					<div
						class="flex size-12 items-center justify-center rounded-lg border border-border/70 bg-background"
					>
						<CalendarRange class="size-6 text-primary" />
					</div>
				</div>
			</CardHeader>

			<CardContent class="p-6">
				{#if Array.isArray(schedule) && schedule.length > 0}
					<div class="space-y-6">
						{#each schedule as dayItem, idx (idx)}
							<div class="space-y-2">
								<h3 class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
									<Clock class="size-4" />
									{dayItem.day ?? `Day ${idx + 1}`}
								</h3>
								{#if dayItem.slots && dayItem.slots.length > 0}
									<div class="overflow-hidden rounded-lg border border-border/60">
										<table class="w-full text-sm">
											<thead class="bg-muted/40 text-xs uppercase text-muted-foreground">
												<tr>
													<th class="px-3 py-2 text-left">Time</th>
													<th class="px-3 py-2 text-left">Course</th>
													<th class="px-3 py-2 text-left">Room</th>
												</tr>
											</thead>
											<tbody>
												{#each dayItem.slots as slot, si (si)}
													<tr class="border-t border-border/60">
														<td class="px-3 py-2 font-mono text-xs">
															{slot.startTime} - {slot.endTime}
														</td>
														<td class="px-3 py-2">{slot.courseName ?? slot.courseCode}</td>
														<td class="px-3 py-2 text-muted-foreground">{slot.room ?? '—'}</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{:else}
									<p class="text-xs text-muted-foreground">No classes scheduled</p>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-center text-sm text-muted-foreground">
						No schedule data available for this timetable.
					</p>
				{/if}
			</CardContent>
		</Card>
	</InView>
</main>
