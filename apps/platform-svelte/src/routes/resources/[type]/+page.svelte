<script lang="ts">
	import RouteParityPage from '$lib/components/common/route-parity-page.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<RouteParityPage routePath={data.routePath} />
