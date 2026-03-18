<script lang="ts">
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import Toast from './Toast.svelte';
</script>

<div
	class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
	aria-live="polite"
	aria-atomic="false"
>
	{#each uiStore.toasts as toast (toast.id)}
		<Toast {toast} />
	{/each}
</div>
