<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Separator } from '$lib/components/ui/separator';
	import type { Snippet } from 'svelte';

	let {
		title,
		description = '',
		hideSeparator = false,
		class: className = '',
		icon,
		action
	}: {
		title: string;
		description?: string;
		hideSeparator?: boolean;
		class?: string;
		icon?: Snippet;
		action?: Snippet;
	} = $props();
</script>

<div class={cn('space-y-4', className)}>
	<div class="flex items-start justify-between gap-4">
		<div class="flex items-start gap-3">
			{#if icon}
				<div class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					{@render icon()}
				</div>
			{/if}
			<div class="space-y-1">
				<h1 class="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
				{#if description}
					<p class="text-sm text-muted-foreground">{description}</p>
				{/if}
			</div>
		</div>
		{#if action}
			<div class="shrink-0">
				{@render action()}
			</div>
		{/if}
	</div>
	{#if !hideSeparator}
		<Separator />
	{/if}
</div>
