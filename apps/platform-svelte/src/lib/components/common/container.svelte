<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children
	}: {
		class?: string;
		children: Snippet;
	} = $props();
</script>

<div class={cn('mx-auto w-full max-w-(--max-app-width) px-4 sm:px-6 lg:px-8', className)}>
	{@render children()}
</div>
