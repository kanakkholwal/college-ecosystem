<script lang="ts">
	import { Sun } from 'lucide-svelte';

	const variantsConfig = {
		variant: ['default', 'link', 'ghost', 'outline', 'dark', 'rainbow', 'destructive'],
		size: ['xs', 'sm', 'default', 'lg', 'icon_xs', 'icon_sm', 'icon', 'icon_lg', 'icon_xl']
	} as const;

	const getVariantClasses = (variant: string): string => {
		switch (variant) {
			case 'link':
				return 'bg-transparent text-primary underline-offset-4 hover:underline';
			case 'ghost':
				return 'bg-transparent text-foreground hover:bg-muted/30';
			case 'outline':
				return 'border border-border/70 bg-card text-foreground';
			case 'dark':
				return 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900';
			case 'rainbow':
				return 'bg-gradient-to-r from-purple-500 via-sky-500 to-emerald-500 text-white';
			case 'destructive':
				return 'bg-destructive text-destructive-foreground';
			default:
				return 'bg-primary text-primary-foreground';
		}
	};

	const getSizeClasses = (size: string): string => {
		switch (size) {
			case 'xs':
				return 'h-7 px-2 text-xs';
			case 'sm':
				return 'h-8 px-3 text-xs';
			case 'lg':
				return 'h-11 px-5 text-sm';
			case 'icon_xs':
				return 'size-7 p-0';
			case 'icon_sm':
				return 'size-8 p-0';
			case 'icon':
				return 'size-10 p-0';
			case 'icon_lg':
				return 'size-11 p-0';
			case 'icon_xl':
				return 'size-12 p-0';
			default:
				return 'h-10 px-4 text-sm';
		}
	};
</script>

<main
	class="mx-auto min-h-screen w-full max-w-[var(--max-app-width)] space-y-10 px-4 py-8 md:px-6 xl:px-12"
>
	<section id="button" class="mx-auto max-w-6xl space-y-8">
		<header
			class="sticky top-0 z-10 rounded-b-lg border-b border-border bg-background/80 px-4 py-4 backdrop-blur-md"
		>
			<h1 class="text-lg font-semibold">Button Variants Showcase</h1>
			<p class="mt-2 text-sm text-muted-foreground">
				A comprehensive overview of all button variants available in the design system.
			</p>
		</header>

		{#each Object.entries(variantsConfig) as [variantType, options] (variantType)}
			<div class="rounded-lg bg-card/40 p-6 shadow">
				<h2 class="mb-6 border-b pb-2 text-xl font-semibold capitalize">{variantType} Variants</h2>
				<div class="flex flex-wrap items-center gap-4">
					{#each options as option (`${variantType}-${option}`)}
						<div class="flex flex-col items-center gap-2">
							<button
								type="button"
								class={`inline-flex items-center justify-center rounded-md font-medium transition-opacity hover:opacity-90 ${variantType === 'variant' ? getVariantClasses(option) : `${getVariantClasses('default')} ${getSizeClasses(option)}`}`}
							>
								{#if variantType === 'size' && option.includes('icon')}
									<Sun class="size-4" />
								{:else}
									Button
								{/if}
							</button>
							<span class="text-xs text-muted-foreground">{option}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</section>

	<section id="badge" class="mx-auto max-w-6xl space-y-8">
		<header
			class="sticky top-0 z-10 rounded-b-lg border-b border-border bg-background/80 px-4 py-4 backdrop-blur-md"
		>
			<h1 class="text-lg font-semibold">Badge Variants Showcase</h1>
			<p class="mt-2 text-sm text-muted-foreground">
				A comprehensive overview of all badge variants available in the design system.
			</p>
		</header>

		{#each Object.entries(variantsConfig) as [variantType, options] (variantType)}
			<div class="rounded-lg bg-card/40 p-6 shadow">
				<h2 class="mb-6 border-b pb-2 text-xl font-semibold capitalize">{variantType} Variants</h2>
				<div class="flex flex-wrap items-center gap-4">
					{#each options as option (`badge-${variantType}-${option}`)}
						<div class="flex flex-col items-center gap-2">
							<span
								class={`inline-flex items-center justify-center rounded-full font-medium ${variantType === 'variant' ? `${getVariantClasses(option)} px-3 py-1 text-xs` : `${getVariantClasses('default')} ${getSizeClasses(option)} rounded-md`}`}
							>
								{#if variantType === 'size' && option.includes('icon')}
									<Sun class="size-4" />
								{:else}
									Badge
								{/if}
							</span>
							<span class="text-xs text-muted-foreground">{option}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</section>
</main>
