<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Inbox } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let {
		title,
		description = '',
		class: className = '',
		icons,
		action
	}: {
		title: string;
		description?: string;
		class?: string;
		icons?: Snippet;
		action?: Snippet;
	} = $props();
</script>

<div
	class={cn(
		'flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center',
		className
	)}
>
	<div class="mb-4 flex items-center justify-center text-muted-foreground/40">
		{#if icons}
			{@render icons()}
		{:else}
			<Inbox class="size-12" strokeWidth={1.5} />
		{/if}
	</div>
	<h3 class="text-lg font-semibold text-foreground">{title}</h3>
	{#if description}
		<p class="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
	{/if}
	{#if action}
		<div class="mt-6">
			{@render action()}
		</div>
	{/if}
</div>
