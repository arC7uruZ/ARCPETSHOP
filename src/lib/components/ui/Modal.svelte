<script lang="ts">
	interface Props {
		open?: boolean;
		title?: string;
		onclose?: () => void;
		children?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
	}

	let { open = $bindable(false), title, onclose, children, footer }: Props = $props();

	function handleClose() {
		open = false;
		onclose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') handleClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
	>
		<button
			class="fixed inset-0 bg-black/50 backdrop-blur-sm"
			onclick={handleClose}
			aria-label="Fechar modal"
			tabindex="-1"
		></button>

		<!-- Panel -->
		<div
			class="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-slide-up"
		>
			{#if title}
				<div class="mb-4 flex items-center justify-between">
					<h2 id="modal-title" class="text-lg font-bold text-gray-900">{title}</h2>
					<button
						onclick={handleClose}
						class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
						aria-label="Fechar"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 6L6 18M6 6l12 12" />
						</svg>
					</button>
				</div>
			{/if}

			<div>{@render children?.()}</div>

			{#if footer}
				<div class="mt-6 flex justify-end gap-3">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
