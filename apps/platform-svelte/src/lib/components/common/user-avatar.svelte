<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { cn } from '$lib/utils.js';

	let {
		user,
		class: className = ''
	}: {
		user: { name: string; image?: string | null; username?: string };
		class?: string;
	} = $props();

	const avatarSrc = $derived(
		user.image && user.image !== 'null' && user.image.trim().length > 0
			? user.image
			: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(user.name)}`
	);

	const initials = $derived(
		user.name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	);
</script>

<Avatar.Root class={cn('size-8', className)}>
	<Avatar.Image src={avatarSrc} alt={user.name} />
	<Avatar.Fallback>{initials}</Avatar.Fallback>
</Avatar.Root>
