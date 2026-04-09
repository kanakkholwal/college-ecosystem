<script lang="ts">
	import { appConfig } from '$lib/config/project';
</script>

<span class="inline-flex items-center gap-2 font-semibold tracking-tight">
	<span
		class="inline-flex size-7 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground"
	>
		{appConfig.shortName}
	</span>
	<span>{appConfig.name}</span>
</span>
