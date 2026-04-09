<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Lock, Home, ArrowLeft } from 'lucide-svelte';
</script>

<div class="flex min-h-[60vh] items-center justify-center px-4">
	<Card.Root class="w-full max-w-md border-amber-500/20 bg-amber-500/5 shadow-lg shadow-amber-500/5">
		<Card.Header class="items-center text-center">
			<div class="mb-2 flex size-16 items-center justify-center rounded-full bg-amber-500/10">
				<Lock class="size-8 text-amber-500" />
			</div>
			<div class="relative mb-1">
				<span class="text-5xl font-black tracking-tighter text-amber-500/20">401</span>
				<span class="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
					Unauthorized
				</span>
			</div>
			<Card.Description class="text-muted-foreground">
				You need to sign in to access this page. Please authenticate and try again.
			</Card.Description>
		</Card.Header>
		<Card.Footer class="flex justify-center gap-3">
			<Button variant="outline" href="/" class="border-amber-500/20 hover:bg-amber-500/5">
				<Home class="size-4" />
				Go Home
			</Button>
			<Button
				variant="ghost"
				onclick={() => history.back()}
				class="hover:bg-amber-500/5"
			>
				<ArrowLeft class="size-4" />
				Go Back
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
