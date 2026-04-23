<script lang="ts">
	import { clsx } from 'clsx';
	import type { PageData } from './$types';
	import { siteConfig } from '$lib/config/site.config';
	import { cartStore } from '$lib/stores/cart.store.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import CartDrawer from '$lib/components/store/CartDrawer.svelte';
	import {
		ShoppingCart,
		Star,
		ChevronLeft,
		Plus,
		Minus,
		Tag,
		Package,
		Truck,
		ShieldCheck,
		RotateCcw
	} from 'lucide-svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const product = $derived(data.product);
	const related = $derived(data.related);

	let qty = $state(1);
	let cartOpen = $state(false);

	function formatPrice(v: number) {
		return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	function discount(price: number, original: number) {
		return Math.round(((original - price) / original) * 100);
	}

	function addToCart() {
		cartStore.add(
			{
				productId: product.id,
				name: product.name,
				brand: product.brand,
				price: product.price,
				imageUrl: product.image_url
			},
			qty
		);
		uiStore.success(`"${product.name}" adicionado ao carrinho!`);
		cartOpen = true;
	}
</script>

<svelte:head>
	<title>{product.name} — {siteConfig.name}</title>
	<meta name="description" content={product.description} />
</svelte:head>

<CartDrawer open={cartOpen} onClose={() => (cartOpen = false)} />

<!-- Cart FAB -->
<button
	onclick={() => (cartOpen = true)}
	class="fixed right-5 bottom-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all hover:bg-primary-600 sm:right-8 sm:bottom-8"
	aria-label="Abrir carrinho"
>
	<ShoppingCart class="h-6 w-6" />
	{#if cartStore.count > 0}
		<span
			class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
		>
			{cartStore.count > 9 ? '9+' : cartStore.count}
		</span>
	{/if}
</button>

<!-- Breadcrumb -->
<div class="border-b border-gray-100 bg-white pt-24 pb-4">
	<div class="container-app">
		<nav class="flex items-center gap-1.5 text-sm text-gray-400">
			<a href="/store" class="hover:text-gray-700 transition-colors">Loja</a>
			{#if product.category}
				<span>/</span>
				<button
					class="hover:text-gray-700 transition-colors"
					onclick={() => (window.location.href = `/store?cat=${product.category?.slug}`)}
				>
					{product.category.name}
				</button>
			{/if}
			<span>/</span>
			<span class="text-gray-600 font-medium truncate max-w-48">{product.name}</span>
		</nav>
	</div>
</div>

<!-- Produto principal -->
<section class="section bg-white">
	<div class="container-app max-w-5xl">
		<div class="grid gap-10 md:grid-cols-2">
			<!-- Imagem -->
			<div class="relative">
				<div
					class="from-primary-50 to-secondary-50 flex aspect-square items-center justify-center rounded-2xl bg-linear-to-br overflow-hidden"
				>
					{#if product.image_url}
						<img
							src={product.image_url}
							alt={product.name}
							class="h-full w-full object-cover"
						/>
					{:else}
						<span class="text-8xl select-none">🐾</span>
					{/if}
				</div>

				{#if product.tag}
					<span
						class={clsx(
							'absolute top-4 left-4 rounded-full px-3 py-1 text-sm font-semibold',
							product.tag === 'Oferta'
								? 'bg-red-100 text-red-600'
								: 'bg-primary-100 text-primary-700'
						)}
					>
						<Tag class="mr-1 inline h-3.5 w-3.5" />
						{product.tag}
					</span>
				{/if}
			</div>

			<!-- Informações -->
			<div class="flex flex-col">
				<!-- Marca + Nome -->
				<p class="text-sm font-semibold tracking-widest text-gray-400 uppercase">
					{product.brand}
				</p>
				<h1 class="font-display mt-1 text-3xl font-bold leading-tight text-gray-900">
					{product.name}
				</h1>

				<!-- Avaliação -->
				<div class="mt-3 flex items-center gap-2">
					<div class="flex items-center gap-0.5">
						{#each Array(5) as _, i}
							<Star
								class={clsx(
									'h-4 w-4',
									i < Math.round(product.rating)
										? 'fill-yellow-400 text-yellow-400'
										: 'text-gray-200'
								)}
							/>
						{/each}
					</div>
					<span class="text-sm font-medium text-gray-700">{product.rating}</span>
					<span class="text-sm text-gray-400">({product.review_count} avaliações)</span>
				</div>

				<!-- Preço -->
				<div class="mt-5 flex items-end gap-3">
					<p class="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</p>
					{#if product.original_price}
						<div class="flex flex-col">
							<span class="text-sm text-gray-400 line-through">
								{formatPrice(product.original_price)}
							</span>
							<span class="text-xs font-semibold text-red-500">
								-{discount(product.price, product.original_price)}% OFF
							</span>
						</div>
					{/if}
				</div>

				<!-- Parcelamento estimado -->
				<p class="mt-1 text-sm text-gray-500">
					ou <span class="font-medium">12x de {formatPrice(product.price / 12)}</span> sem juros
				</p>

				<!-- Descrição -->
				<p class="mt-5 leading-relaxed text-gray-600">{product.description}</p>

				<!-- Estoque -->
				{#if product.stock_quantity > 0}
					<div class="mt-4 flex items-center gap-2 text-sm text-green-600">
						<Package class="h-4 w-4" />
						<span class="font-medium">
							{product.stock_quantity > 10
								? 'Em estoque'
								: `Apenas ${product.stock_quantity} unidades`}
						</span>
					</div>
				{:else}
					<div class="mt-4 flex items-center gap-2 text-sm text-red-500">
						<Package class="h-4 w-4" />
						<span class="font-medium">Fora de estoque</span>
					</div>
				{/if}

				<!-- Seletor de quantidade + CTA -->
				{#if product.stock_quantity > 0}
					<div class="mt-6 flex items-center gap-4">
						<!-- Qty -->
						<div class="flex items-center rounded-xl border border-gray-200">
							<button
								onclick={() => (qty = Math.max(1, qty - 1))}
								class="flex h-11 w-11 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 rounded-l-xl"
								aria-label="Diminuir"
							>
								<Minus class="h-4 w-4" />
							</button>
							<span class="w-10 text-center text-sm font-semibold text-gray-800">{qty}</span>
							<button
								onclick={() => (qty = Math.min(product.stock_quantity, qty + 1))}
								class="flex h-11 w-11 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 rounded-r-xl"
								aria-label="Aumentar"
							>
								<Plus class="h-4 w-4" />
							</button>
						</div>

						<!-- Add to cart -->
						<button
							onclick={addToCart}
							class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
						>
							<ShoppingCart class="h-5 w-5" />
							Adicionar ao carrinho
						</button>
					</div>
				{/if}

				<!-- Benefícios -->
				<div class="mt-6 space-y-2 border-t border-gray-100 pt-5">
					<div class="flex items-center gap-2.5 text-sm text-gray-500">
						<Truck class="h-4 w-4 text-primary-500 shrink-0" />
						<span>Frete grátis em pedidos acima de R$ 150</span>
					</div>
					<div class="flex items-center gap-2.5 text-sm text-gray-500">
						<ShieldCheck class="h-4 w-4 text-primary-500 shrink-0" />
						<span>Produto original com nota fiscal</span>
					</div>
					<div class="flex items-center gap-2.5 text-sm text-gray-500">
						<RotateCcw class="h-4 w-4 text-primary-500 shrink-0" />
						<span>Troca fácil em até 30 dias</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Produtos relacionados -->
{#if related.length > 0}
	<section class="section bg-gray-50">
		<div class="container-app">
			<h2 class="mb-6 text-xl font-bold text-gray-900">Produtos relacionados</h2>
			<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{#each related as rel (rel.id)}
					<a
						href="/store/produto/{rel.slug}"
						class="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
					>
						<div
							class="from-primary-50 to-secondary-50 flex h-36 items-center justify-center rounded-t-2xl bg-linear-to-br text-5xl overflow-hidden"
						>
							{#if rel.image_url}
								<img
									src={rel.image_url}
									alt={rel.name}
									class="h-full w-full rounded-t-2xl object-cover"
								/>
							{:else}
								🐾
							{/if}
						</div>
						<div class="flex flex-1 flex-col p-4">
							<p class="text-xs font-medium tracking-wide text-gray-400 uppercase">
								{rel.brand}
							</p>
							<h3 class="mt-0.5 text-sm font-semibold leading-snug text-gray-900">
								{rel.name}
							</h3>
							<div class="mt-auto pt-3 flex items-center justify-between">
								<p class="font-bold text-gray-900">{formatPrice(rel.price)}</p>
								<span
									class="rounded-lg bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700"
								>
									Ver
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Back to store -->
<div class="bg-gray-50 pb-12">
	<div class="container-app">
		<a
			href="/store"
			class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
		>
			<ChevronLeft class="h-4 w-4" />
			Voltar à loja
		</a>
	</div>
</div>
