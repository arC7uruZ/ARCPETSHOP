<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		emoji?: string;
		action?: import('svelte').Snippet;
	}

	let { title, description, emoji = '🐾', action }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 text-center">
	<div class="mb-4 text-6xl">{emoji}</div>
	<h3 class="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
	{#if description}
		<p class="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
	{/if}
	{#if action}
		{@render action()}
	{/if}
</div>
