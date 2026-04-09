<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Badge } from '$lib/components/ui/badge';
	import { ExternalLink } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let {
		href,
		title,
		description = '',
		external = false,
		disabled = false,
		class: className = '',
		icon
	}: {
		href: string;
		title: string;
		description?: string;
		external?: boolean;
		disabled?: boolean;
		class?: string;
		icon?: Snippet;
	} = $props();
</script>

<svelte:element
	this={disabled ? 'div' : 'a'}
	href={disabled ? undefined : href}
	target={external ? '_blank' : undefined}
	rel={external ? 'noopener noreferrer' : undefined}
	class={cn(
		'group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-all duration-200',
		disabled
			? 'cursor-not-allowed opacity-60'
			: 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30',
		className
	)}
>
	<div class="flex items-start justify-between gap-3">
		<div class="flex items-start gap-3">
			{#if icon}
				<div
					class={cn(
						'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
						disabled
							? 'bg-muted text-muted-foreground'
							: 'bg-primary/10 text-primary group-hover:bg-primary/15'
					)}
				>
					{@render icon()}
				</div>
			{/if}
			<div class="space-y-1">
				<h3 class="text-sm font-semibold leading-tight text-foreground">{title}</h3>
				{#if description}
					<p class="text-xs text-muted-foreground line-clamp-2">{description}</p>
				{/if}
			</div>
		</div>

		<div class="flex shrink-0 items-center gap-1.5">
			{#if disabled}
				<Badge variant="secondary" class="text-[10px] px-1.5 py-0">Soon</Badge>
			{/if}
			{#if external && !disabled}
				<ExternalLink
					class="size-3.5 text-muted-foreground transition-colors group-hover:text-primary"
				/>
			{/if}
		</div>
	</div>
</svelte:element>
