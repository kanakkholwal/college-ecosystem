<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import InView from '$lib/components/animation/in-view.svelte';
	import MagicCard from '$lib/components/animation/magic-card.svelte';
	import { Gift, Sparkles, ExternalLink } from 'lucide-svelte';

	type Benefit = {
		name: string;
		description: string;
		link: string;
		category: 'Software' | 'Learning' | 'Cloud' | 'Hardware' | 'Design';
		isNew?: boolean;
	};

	const benefits: Benefit[] = [
		{
			name: 'GitHub Student Pack',
			description: 'Free access to tools, services, and learning resources from 100+ tech companies.',
			link: 'https://education.github.com/pack',
			category: 'Software',
			isNew: true
		},
		{
			name: 'JetBrains Toolbox',
			description: 'Free access to all JetBrains IDEs including IntelliJ IDEA, PyCharm, WebStorm.',
			link: 'https://www.jetbrains.com/community/education/',
			category: 'Software'
		},
		{
			name: 'Microsoft Office 365',
			description: 'Free Office 365 with Word, Excel, PowerPoint, Teams for students.',
			link: 'https://www.microsoft.com/en-us/education/products/office',
			category: 'Software'
		},
		{
			name: 'Figma Education',
			description: 'Free access to Figma Professional for students and educators.',
			link: 'https://www.figma.com/education/',
			category: 'Design'
		},
		{
			name: 'Notion for Students',
			description: 'Free Notion Plus plan with unlimited blocks and file uploads.',
			link: 'https://www.notion.so/product/notion-for-education',
			category: 'Software'
		},
		{
			name: 'Canva Pro',
			description: 'Free Canva Pro for verified students.',
			link: 'https://www.canva.com/education/',
			category: 'Design'
		},
		{
			name: 'AWS Educate',
			description: 'Free cloud credits and training resources for students.',
			link: 'https://aws.amazon.com/education/awseducate/',
			category: 'Cloud'
		},
		{
			name: 'Coursera for Campus',
			description: 'Free access to thousands of courses from top universities.',
			link: 'https://www.coursera.org/for-campus',
			category: 'Learning'
		},
		{
			name: 'LinkedIn Learning',
			description: 'Free LinkedIn Learning with student verification.',
			link: 'https://www.linkedin.com/learning/',
			category: 'Learning'
		}
	];

	const categories = ['All', 'Software', 'Learning', 'Cloud', 'Design'] as const;
	let activeCategory = $state<(typeof categories)[number]>('All');

	const filtered = $derived(
		activeCategory === 'All' ? benefits : benefits.filter((b) => b.category === activeCategory)
	);
</script>

<svelte:head>
	<title>Student Benefits - Free Stuff for College Students</title>
	<meta
		name="description"
		content="Explore exclusive student discounts, free software, and learning resources available through your student ID."
	/>
</svelte:head>

<main class="mx-auto w-full max-w-(--max-app-width) space-y-8 px-4 py-10 md:px-6">
	<InView variant="fly-up">
		<section class="space-y-4 text-center">
			<div
				class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
			>
				<Sparkles class="size-3.5 text-primary" />
				Exclusive Offers
			</div>
			<h1 class="text-4xl font-bold tracking-tight md:text-5xl">
				Free Stuff for <span class="text-primary">Students</span>
			</h1>
			<p class="mx-auto max-w-2xl text-muted-foreground md:text-lg">
				From software tools to learning platforms, explore how you can enhance your college
				experience with these exclusive offers.
			</p>
		</section>
	</InView>

	<div class="flex flex-wrap items-center justify-center gap-2">
		{#each categories as category (category)}
			<Button
				variant={activeCategory === category ? 'default' : 'outline'}
				size="sm"
				onclick={() => (activeCategory = category)}
			>
				{category}
			</Button>
		{/each}
	</div>

	<StaggerContainer class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each filtered as benefit (benefit.name)}
			<MagicCard class="h-full">
				<a
					href={benefit.link}
					target="_blank"
					rel="noopener noreferrer"
					class="flex h-full flex-col gap-3 p-6"
				>
					<div class="flex items-start justify-between gap-3">
						<div
							class="flex size-10 items-center justify-center rounded-lg border border-border/50 bg-muted/50 text-primary"
						>
							<Gift class="size-5" />
						</div>
						{#if benefit.isNew}
							<Badge class="text-[10px]">New</Badge>
						{/if}
					</div>
					<div class="flex-1">
						<h3 class="font-semibold tracking-tight">{benefit.name}</h3>
						<p class="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
					</div>
					<div class="flex items-center justify-between text-xs">
						<Badge variant="secondary">{benefit.category}</Badge>
						<span class="inline-flex items-center gap-1 text-primary">
							Claim <ExternalLink class="size-3" />
						</span>
					</div>
				</a>
			</MagicCard>
		{/each}
	</StaggerContainer>
</main>
