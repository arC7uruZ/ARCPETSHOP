<script lang="ts">
	import type { Toast } from '$lib/types';
	import { uiStore } from '$lib/stores/ui.store.svelte';

	interface Props {
		toast: Toast;
	}

	let { toast }: Props = $props();

	const icons: Record<string, string> = {
		success: '✅',
		error: '❌',
		warning: '⚠️',
		info: 'ℹ️'
	};

	const colors: Record<string, string> = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800'
	};
</script>

<div
	class="flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-slide-up {colors[
		toast.type
	]}"
	role="alert"
>
	<span class="text-lg leading-none">{icons[toast.type]}</span>
	<p class="flex-1 text-sm font-medium">{toast.message}</p>
	<button
		onclick={() => uiStore.removeToast(toast.id)}
		class="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
		aria-label="Fechar"
	>
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M18 6L6 18M6 6l12 12" />
		</svg>
	</button>
</div>
