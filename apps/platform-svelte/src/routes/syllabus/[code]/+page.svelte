<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import InView from '$lib/components/animation/in-view.svelte';
	import { ArrowLeft, BookOpen, FileText, Layers, ExternalLink } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	const course = $derived(data.course!);
</script>

<svelte:head>
	<title>{course.code} - {course.name}</title>
	<meta name="description" content={`Syllabus, books and previous papers for ${course.code} - ${course.name}`} />
</svelte:head>

<main class="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 md:px-6">
	<a
		href="/syllabus"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="size-4" />
		Back to Syllabus
	</a>

	<InView variant="fly-up">
		<Card>
			<CardHeader class="border-b bg-muted/20">
				<div class="flex items-start justify-between gap-4">
					<div>
						<div class="mb-2 flex items-center gap-2">
							<Badge variant="secondary" class="font-mono">{course.code}</Badge>
							<Badge variant="outline">{course.type}</Badge>
						</div>
						<CardTitle class="text-2xl md:text-3xl">{course.name}</CardTitle>
						<p class="mt-1 text-sm text-muted-foreground">{course.department}</p>
					</div>
					<div
						class="flex size-12 items-center justify-center rounded-lg border border-border/70 bg-background"
					>
						<BookOpen class="size-6 text-primary" />
					</div>
				</div>
			</CardHeader>
		</Card>
	</InView>

	{#if data.chapters.length > 0}
		<InView variant="fly-up">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-lg">
						<Layers class="size-5 text-primary" />
						Chapters ({data.chapters.length})
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					{#each data.chapters as chapter, idx (chapter.id)}
						<div class="rounded-lg border border-border/60 p-4">
							<div class="flex items-start justify-between gap-3">
								<h3 class="font-semibold">
									<span class="mr-2 font-mono text-xs text-muted-foreground">{idx + 1}.</span>
									{chapter.title}
								</h3>
								{#if chapter.lectures}
									<Badge variant="outline" class="shrink-0 text-xs">
										{chapter.lectures} lectures
									</Badge>
								{/if}
							</div>
							{#if chapter.topics && chapter.topics.length > 0}
								<ul class="mt-2 space-y-1 pl-6 text-sm text-muted-foreground">
									{#each chapter.topics as topic (topic)}
										<li class="list-disc">{topic}</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/each}
				</CardContent>
			</Card>
		</InView>
	{/if}

	{#if data.booksAndReferences.length > 0}
		<InView variant="fly-up">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-lg">
						<BookOpen class="size-5 text-primary" />
						Books & References
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-2">
					{#each data.booksAndReferences as book (book.id)}
						<a
							href={book.link || '#'}
							target="_blank"
							rel="noopener noreferrer"
							class="group flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
						>
							<div class="min-w-0 flex-1">
								<p class="truncate font-medium">{book.name}</p>
								<p class="text-xs text-muted-foreground">{book.type}</p>
							</div>
							<ExternalLink class="size-4 text-muted-foreground group-hover:text-primary" />
						</a>
					{/each}
				</CardContent>
			</Card>
		</InView>
	{/if}

	{#if data.previousPapers.length > 0}
		<InView variant="fly-up">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-lg">
						<FileText class="size-5 text-primary" />
						Previous Year Papers
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
						{#each data.previousPapers as paper (paper.id)}
							<a
								href={paper.link || '#'}
								target="_blank"
								rel="noopener noreferrer"
								class="group flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
							>
								<div>
									<p class="font-medium">{paper.year} · {paper.exam}</p>
								</div>
								<ExternalLink class="size-4 text-muted-foreground group-hover:text-primary" />
							</a>
						{/each}
					</div>
				</CardContent>
			</Card>
		</InView>
	{/if}

	{#if data.chapters.length === 0 && data.booksAndReferences.length === 0 && data.previousPapers.length === 0}
		<Separator />
		<p class="text-center text-sm text-muted-foreground">
			No syllabus materials available for this course yet.
		</p>
	{/if}
</main>
