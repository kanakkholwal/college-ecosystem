<script lang="ts">
	import { appConfig } from '$lib/config/project';
	import { ExternalLink, GitBranch, Star } from 'lucide-svelte';
</script>

<section class="overflow-hidden py-16 lg:py-20">
	<div
		class="mx-auto grid w-full max-w-5xl gap-8 rounded-3xl border border-border/40 bg-card/70 p-8 shadow-sm backdrop-blur-sm lg:grid-cols-[1fr_auto]"
	>
		<div class="space-y-5">
			<div
				class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs"
			>
				<Star class="size-3.5" /> Open Source
			</div>
			<h2 class="text-2xl font-semibold tracking-tight lg:text-3xl">Transparency at core.</h2>
			<p class="max-w-2xl text-sm text-muted-foreground lg:text-base">
				This platform is built by students, for students. Track progress, propose changes, and
				contribute openly.
			</p>
			<div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
				<span class="inline-flex items-center gap-1.5"><Star class="size-4" /> Stars</span>
				<span class="inline-flex items-center gap-1.5"><GitBranch class="size-4" /> Forks</span>
			</div>
		</div>

		<div class="flex flex-col justify-center gap-3 lg:w-64">
			<a
				href={appConfig.githubRepo}
				target="_blank"
				rel="external noreferrer noopener"
				class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
			>
				<Star class="size-4" /> Star repository
			</a>
			<a
				href={`${appConfig.githubRepo}/issues`}
				target="_blank"
				rel="external noreferrer noopener"
				class="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
			>
				<ExternalLink class="size-4" /> Open issues
			</a>
		</div>
	</div>
</section>
