<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import InView from '$lib/components/animation/in-view.svelte';
	import StaggerContainer from '$lib/components/animation/stagger-container.svelte';
	import NumberTicker from '$lib/components/animation/number-ticker.svelte';
	import { ArrowRight, Mail, User, FileText, MessageSquare, Vote, Megaphone } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	const profile = $derived(data.profile);
	const activities = $derived(data.activities);

	const avatarSrc = $derived(
		profile.image && profile.image !== 'null' && profile.image.trim().length > 0
			? profile.image
			: `https://api.dicebear.com/5.x/initials/svg?seed=${profile.name}`
	);
</script>

<svelte:head>
	<title>{profile.name} (@{profile.username}) | Profile</title>
</svelte:head>

<main class="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 md:px-6">
	<InView variant="fly-up">
		<Card>
			<CardHeader class="border-b bg-muted/20">
				<div class="flex flex-wrap items-center gap-4">
					<Avatar.Root class="size-20 border-2 border-border">
						<Avatar.Image src={avatarSrc} alt={profile.name} />
						<Avatar.Fallback class="text-2xl">
							{profile.name.charAt(0).toUpperCase()}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="flex-1 space-y-1">
						<div class="flex items-center gap-2">
							<h1 class="text-2xl font-bold tracking-tight">{profile.name}</h1>
							{#if profile.role === 'admin'}
								<Badge variant="destructive">Admin</Badge>
							{/if}
						</div>
						<p class="text-sm text-muted-foreground">@{profile.username}</p>
						<div class="flex flex-wrap items-center gap-2 pt-2">
							<Badge variant="secondary" class="gap-1.5">
								<User class="size-3" />
								{profile.department}
							</Badge>
							{#each profile.other_roles as role (role)}
								<Badge variant="outline" class="text-[10px] capitalize">{role}</Badge>
							{/each}
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent class="p-6">
				<div class="flex items-center gap-3 text-sm text-muted-foreground">
					<Mail class="size-4" />
					<span class="font-mono">{profile.email}</span>
				</div>
			</CardContent>
		</Card>
	</InView>

	<InView variant="fly-up">
		<div>
			<h2 class="mb-4 text-lg font-semibold">Platform Activity</h2>
			<StaggerContainer class="grid grid-cols-2 gap-4 md:grid-cols-4">
				<Card class="p-4">
					<div class="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<FileText class="size-4" />
					</div>
					<p class="text-xs text-muted-foreground">Posts</p>
					<p class="text-2xl font-bold">
						<NumberTicker value={activities.communityPostsCount} />
					</p>
				</Card>
				<Card class="p-4">
					<div class="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<MessageSquare class="size-4" />
					</div>
					<p class="text-xs text-muted-foreground">Comments</p>
					<p class="text-2xl font-bold">
						<NumberTicker value={activities.communityCommentsCount} />
					</p>
				</Card>
				<Card class="p-4">
					<div class="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Vote class="size-4" />
					</div>
					<p class="text-xs text-muted-foreground">Polls</p>
					<p class="text-2xl font-bold">
						<NumberTicker value={activities.pollsCount} />
					</p>
				</Card>
				<Card class="p-4">
					<div class="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Megaphone class="size-4" />
					</div>
					<p class="text-xs text-muted-foreground">Announcements</p>
					<p class="text-2xl font-bold">
						<NumberTicker value={activities.announcementsCount} />
					</p>
				</Card>
			</StaggerContainer>
		</div>
	</InView>

	<Button href={`/results/${profile.username}`} variant="outline" class="gap-2">
		View Academic Result <ArrowRight class="size-4" />
	</Button>
</main>
