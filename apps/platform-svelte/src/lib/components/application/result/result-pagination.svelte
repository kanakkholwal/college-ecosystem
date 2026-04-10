<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	let {
		totalPages,
		currentPage
	}: { totalPages: number; currentPage: number } = $props();

	function goTo(p: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', String(p));
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: false });
	}

	const pagesToShow = $derived.by(() => {
		const max = 5;
		const half = Math.floor(max / 2);
		let start = Math.max(1, currentPage - half);
		let end = Math.min(totalPages, start + max - 1);
		if (end - start + 1 < max) start = Math.max(1, end - max + 1);
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	});
</script>

{#if totalPages > 1}
	<div class="flex items-center justify-center gap-2">
		<Button
			variant="outline"
			size="sm"
			disabled={currentPage <= 1}
			onclick={() => goTo(currentPage - 1)}
		>
			<ChevronLeft class="size-4" />
		</Button>

		{#each pagesToShow as p (p)}
			<Button
				variant={p === currentPage ? 'default' : 'outline'}
				size="sm"
				onclick={() => goTo(p)}
			>
				{p}
			</Button>
		{/each}

		<Button
			variant="outline"
			size="sm"
			disabled={currentPage >= totalPages}
			onclick={() => goTo(currentPage + 1)}
		>
			<ChevronRight class="size-4" />
		</Button>
	</div>
{/if}
