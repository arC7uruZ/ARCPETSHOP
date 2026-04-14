<script lang="ts">
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import Toast from './Toast.svelte';
</script>

<div
	class="fixed right-4 bottom-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
	aria-live="polite"
	aria-atomic="false"
>
	{#each uiStore.toasts as toast (toast.id)}
		<Toast {toast} />
	{/each}
</div>
