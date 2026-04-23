<script lang="ts">
	import { clsx } from 'clsx';
	import { goto } from '$app/navigation';
	import { cartStore } from '$lib/stores/cart.store.svelte';
	import { X, ShoppingCart, Trash2, Plus, Minus, PackageCheck } from 'lucide-svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	const FREE_SHIPPING_THRESHOLD = 150;

	function formatPrice(value: number) {
		return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	function goToCheckout() {
		onClose();
		goto('/store/checkout');
	}
</script>

<!-- Backdrop -->
{#if open}
	<div
		class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
		role="button"
		tabindex="-1"
		aria-label="Fechar carrinho"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	></div>
{/if}

<!-- Drawer -->
<div
	class={clsx(
		'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl',
		'transition-transform duration-300 ease-in-out',
		open ? 'translate-x-0' : 'translate-x-full'
	)}
>
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
		<div class="flex items-center gap-2">
			<ShoppingCart class="text-primary-600 h-5 w-5" />
			<h2 class="font-semibold text-gray-900">Carrinho</h2>
			{#if cartStore.count > 0}
				<span
					class="bg-primary-500 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
				>
					{cartStore.count}
				</span>
			{/if}
		</div>
		<button
			onclick={onClose}
			class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
			aria-label="Fechar"
		>
			<X class="h-5 w-5" />
		</button>
	</div>

	<!-- Items -->
	<div class="flex-1 overflow-y-auto px-5 py-4">
		{#if cartStore.items.length === 0}
			<div class="flex flex-col items-center justify-center py-16 text-center text-gray-400">
				<ShoppingCart class="mb-3 h-12 w-12 opacity-30" />
				<p class="font-medium text-gray-600">Carrinho vazio</p>
				<p class="mt-1 text-sm">Adicione produtos para continuar.</p>
			</div>
		{:else}
			<ul class="space-y-4">
				{#each cartStore.items as item (item.productId)}
					<li class="flex gap-3">
						<!-- Image placeholder -->
						<div
							class="from-primary-50 to-secondary-50 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-2xl"
						>
							🐾
						</div>

						<div class="min-w-0 flex-1">
							<p class="text-xs font-medium tracking-wide text-gray-400 uppercase">
								{item.brand}
							</p>
							<p class="truncate text-sm font-semibold text-gray-900">{item.name}</p>
							<p class="mt-0.5 text-sm font-bold text-gray-800">
								{formatPrice(item.price)}
							</p>
						</div>

						<!-- Quantity controls -->
						<div class="flex flex-col items-end gap-2">
							<button
								onclick={() => cartStore.remove(item.productId)}
								class="text-gray-300 transition-colors hover:text-red-400"
								aria-label="Remover item"
							>
								<Trash2 class="h-4 w-4" />
							</button>
							<div class="flex items-center gap-1.5">
								<button
									onclick={() => cartStore.setQty(item.productId, item.quantity - 1)}
									class="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
									aria-label="Diminuir quantidade"
								>
									<Minus class="h-3 w-3" />
								</button>
								<span class="w-5 text-center text-sm font-semibold text-gray-800">
									{item.quantity}
								</span>
								<button
									onclick={() => cartStore.setQty(item.productId, item.quantity + 1)}
									class="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
									aria-label="Aumentar quantidade"
								>
									<Plus class="h-3 w-3" />
								</button>
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<!-- Free shipping progress -->
			{#if cartStore.subtotal < FREE_SHIPPING_THRESHOLD}
				{@const progress = (cartStore.subtotal / FREE_SHIPPING_THRESHOLD) * 100}
				<div class="mt-5 rounded-xl bg-amber-50 p-3">
					<p class="text-xs text-amber-700">
						Falta <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - cartStore.subtotal)}</strong> para
						frete grátis!
					</p>
					<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
						<div
							class="h-full rounded-full bg-amber-500 transition-all duration-500"
							style="width: {Math.min(progress, 100)}%"
						></div>
					</div>
				</div>
			{:else}
				<div class="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-green-700">
					<PackageCheck class="h-4 w-4 shrink-0" />
					<p class="text-xs font-medium">Frete grátis no seu pedido!</p>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Footer -->
	{#if cartStore.items.length > 0}
		<div class="border-t border-gray-100 px-5 py-4 space-y-3">
			<!-- Totals -->
			<div class="space-y-1.5 text-sm">
				<div class="flex justify-between text-gray-500">
					<span>Subtotal</span>
					<span>{formatPrice(cartStore.subtotal)}</span>
				</div>
				<div class="flex justify-between text-gray-500">
					<span>Frete</span>
					<span class={cartStore.shipping === 0 ? 'font-medium text-green-600' : ''}>
						{cartStore.shipping === 0 ? 'Grátis' : formatPrice(cartStore.shipping)}
					</span>
				</div>
				<div class="flex justify-between border-t border-gray-100 pt-1.5 font-bold text-gray-900">
					<span>Total</span>
					<span>{formatPrice(cartStore.total)}</span>
				</div>
			</div>

			<button
				onclick={goToCheckout}
				class="bg-primary-500 hover:bg-primary-600 w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors"
			>
				Finalizar pedido
			</button>
		</div>
	{/if}
</div>
