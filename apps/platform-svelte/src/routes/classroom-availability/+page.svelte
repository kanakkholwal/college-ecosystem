<script lang="ts">
	import InView from '$lib/components/animation/in-view.svelte';
	import EmptyArea from '$lib/components/common/empty-area.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Presentation, Clock, Construction } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Classroom Availability | College Platform</title>
</svelte:head>

<main class="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 md:px-6">
	<InView variant="fly-up">
		<div class="space-y-2">
			<div
				class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
			>
				<Presentation class="size-3.5 text-primary" />
				Live Campus Data
			</div>
			<h1 class="text-3xl font-bold tracking-tight md:text-4xl">Classroom Finder</h1>
			<p class="text-muted-foreground">Live occupancy status of lecture halls across campus.</p>
		</div>
	</InView>

	<InView variant="fly-up">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-lg">
					<Construction class="size-5 text-primary" />
					Coming Soon
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Live classroom availability data is being wired up to the new timetable system. Check back
					soon for real-time room status, occupancy info, and free slots.
				</p>
				<div class="flex items-center gap-2 text-xs text-muted-foreground">
					<Clock class="size-3.5" />
					Data source integration in progress
				</div>
			</CardContent>
		</Card>
	</InView>
</main>
