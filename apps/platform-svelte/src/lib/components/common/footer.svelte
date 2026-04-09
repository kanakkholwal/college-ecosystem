<script lang="ts">
	import { resolve } from '$app/paths';
	import ApplicationInfo from '$lib/components/common/application-info.svelte';
	import { appConfig, supportLinks } from '$lib/config/project';
	import { ArrowUpRight } from 'lucide-svelte';

	const aboutLinks = [
		{ title: 'About', href: '/about' },
		{ title: 'Contact', href: '/contact' },
		{ title: 'Privacy Policy', href: '/privacy-policy' },
		{ title: 'Terms', href: '/terms' }
	] as const;
</script>

<footer class="border-t border-border/40 bg-background pt-14 pb-8 lg:pt-20">
	<div class="mx-auto grid w-full max-w-(--max-app-width) gap-10 px-4 lg:grid-cols-3">
		<div class="space-y-4">
			<a href={resolve('/')} class="transition-opacity hover:opacity-80"><ApplicationInfo /></a>
			<p class="max-w-xs text-sm text-muted-foreground">{appConfig.description}</p>
		</div>

		<div>
			<h3 class="mb-4 text-sm font-semibold">Community</h3>
			<ul class="space-y-2">
				{#each supportLinks as link (link.href)}
					<li>
						<a
							href={link.href}
							rel="external noreferrer noopener"
							class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							{link.title}
							<ArrowUpRight class="size-3.5" />
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div>
			<h3 class="mb-4 text-sm font-semibold">About & Legal</h3>
			<ul class="space-y-2">
				{#each aboutLinks as link (link.href)}
					<li>
						<a
							href={resolve(link.href)}
							class="text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							{link.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div
		class="mx-auto mt-10 flex w-full max-w-(--max-app-width) items-center justify-between gap-3 border-t border-border/40 px-4 pt-6"
	>
		<p class="text-xs text-muted-foreground">
			© {new Date().getFullYear()}
			{appConfig.name}. All rights reserved.
		</p>
		<a
			href={appConfig.githubRepo}
			target="_blank"
			rel="external noreferrer noopener"
			class="text-xs text-muted-foreground hover:text-primary"
		>
			GitHub
		</a>
	</div>
</footer>
