<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Home } from 'lucide-svelte';
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
	<div class="relative mb-8">
		<span
			class="select-none text-[10rem] font-black leading-none tracking-tighter text-muted-foreground/10 sm:text-[14rem]"
		>
			404
		</span>
		<h1
			class="absolute inset-0 flex items-center justify-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
		>
			Page Not Found
		</h1>
	</div>
	<p class="mb-8 max-w-md text-muted-foreground">
		The page you are looking for does not exist or has been moved. Please check the URL or navigate
		back to a known page.
	</p>
	<div class="flex items-center gap-3">
		<Button variant="outline" href="/">
			<Home class="size-4" />
			Go Home
		</Button>
		<Button
			variant="ghost"
			onclick={() => history.back()}
		>
			<ArrowLeft class="size-4" />
			Go Back
		</Button>
	</div>
</div>
