<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Search, X } from 'lucide-svelte';

	let {
		branches,
		batches,
		programmes
	}: {
		branches: string[];
		batches: (string | number)[];
		programmes: string[];
	} = $props();

	const current = $derived(page.url.searchParams);
	let query = $state(current.get('query') ?? '');
	let branch = $state(current.get('branch') ?? 'all');
	let batch = $state(current.get('batch') ?? 'all');
	let programme = $state(current.get('programme') ?? 'all');

	function updateParams(e: Event) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (query) params.set('query', query);
		if (branch !== 'all') params.set('branch', branch);
		if (batch !== 'all') params.set('batch', batch);
		if (programme !== 'all') params.set('programme', programme);
		params.set('page', '1');
		goto(`/results?${params.toString()}`, { keepFocus: true });
	}

	function clearFilters() {
		query = '';
		branch = 'all';
		batch = 'all';
		programme = 'all';
		goto('/results');
	}
</script>

<form
	onsubmit={updateParams}
	class="mx-auto w-full max-w-3xl space-y-3 rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur"
>
	<div class="relative">
		<Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="search"
			bind:value={query}
			placeholder="Search by name or roll number..."
			class="pl-9 pr-10"
		/>
		{#if query}
			<button
				type="button"
				onclick={() => (query = '')}
				class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				aria-label="Clear search"
			>
				<X class="size-4" />
			</button>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
		<select
			bind:value={branch}
			class="rounded-md border border-border bg-background px-3 py-2 text-sm"
		>
			<option value="all">All Branches</option>
			{#each branches as b (b)}
				<option value={b}>{b}</option>
			{/each}
		</select>

		<select
			bind:value={batch}
			class="rounded-md border border-border bg-background px-3 py-2 text-sm"
		>
			<option value="all">All Batches</option>
			{#each batches as b (String(b))}
				<option value={String(b)}>{b}</option>
			{/each}
		</select>

		<select
			bind:value={programme}
			class="rounded-md border border-border bg-background px-3 py-2 text-sm"
		>
			<option value="all">All Programmes</option>
			{#each programmes as p (p)}
				<option value={p}>{p}</option>
			{/each}
		</select>
	</div>

	<div class="flex items-center gap-2">
		<Button type="submit" class="flex-1">
			<Search class="mr-2 size-4" /> Search
		</Button>
		<Button type="button" variant="outline" onclick={clearFilters}>Clear</Button>
	</div>
</form>
