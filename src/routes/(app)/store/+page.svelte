<script lang="ts">
	import { clsx } from 'clsx';
	import type { PageData } from './$types';
	import { siteConfig } from '$lib/config/site.config';
	import Button from '$lib/components/ui/Button.svelte';
	import CartDrawer from '$lib/components/store/CartDrawer.svelte';
	import { cartStore } from '$lib/stores/cart.store.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import {
		ShoppingCart,
		Search,
		SlidersHorizontal,
		Star,
		Truck,
		ShieldCheck,
		RotateCcw,
		Plus
	} from 'lucide-svelte';
	import type { Product } from '$lib/types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let selectedCategory = $state('all');
	let searchQuery = $state('');
	let sortBy = $state<'relevancia' | 'menor-preco' | 'maior-preco' | 'avaliacao'>('relevancia');
	let cartOpen = $state(false);

	const allCategories = $derived([
		{ id: 'all', name: 'Todos' },
		...data.categories
	]);

	const filtered = $derived(() => {
		let result: Product[] = data.products;

		if (selectedCategory !== 'all') {
			result = result.filter((p) => p.category?.slug === selectedCategory);
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					p.brand.toLowerCase().includes(q) ||
					p.description.toLowerCase().includes(q)
			);
		}

		if (sortBy === 'menor-preco') result = [...result].sort((a, b) => a.price - b.price);
		else if (sortBy === 'maior-preco') result = [...result].sort((a, b) => b.price - a.price);
		else if (sortBy === 'avaliacao') result = [...result].sort((a, b) => b.rating - a.rating);

		return result;
	});

	function formatPrice(value: number) {
		return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	function addToCart(product: Product) {
		cartStore.add({
			productId: product.id,
			name: product.name,
			brand: product.brand,
			price: product.price,
			imageUrl: product.image_url
		});
		uiStore.success(`"${product.name}" adicionado ao carrinho!`);
		cartOpen = true;
	}
</script>

<svelte:head>
	<title>Loja — {siteConfig.name}</title>
	<meta
		name="description"
		content="Encontre os melhores produtos para o seu pet. Rações, brinquedos, acessórios e muito mais."
	/>
</svelte:head>

<CartDrawer open={cartOpen} onClose={() => (cartOpen = false)} />

<!-- Cart FAB -->
<button
	onclick={() => (cartOpen = true)}
	class={clsx(
		'fixed right-5 bottom-5 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg',
		'bg-primary-500 hover:bg-primary-600 text-white transition-all duration-200',
		'sm:right-8 sm:bottom-8'
	)}
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

<!-- Hero -->
<div class="from-primary-500 to-secondary-500 bg-linear-to-br pt-32 pb-16">
	<div class="container-app text-center text-white">
		<div
			class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm"
		>
			<ShoppingCart class="h-4 w-4" />
			<span>Loja Online</span>
		</div>
		<h1 class="font-display text-4xl font-bold sm:text-5xl">Produtos para o seu pet</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-white/85">
			Rações premium, brinquedos, acessórios e produtos de saúde selecionados pelos nossos
			veterinários. Entrega rápida na sua casa.
		</p>
	</div>
</div>

<!-- Benefícios -->
<div class="border-b border-gray-100 bg-white">
	<div class="container-app">
		<div class="grid grid-cols-1 gap-4 py-6 sm:grid-cols-3">
			<div class="flex items-center gap-3 text-sm text-gray-600">
				<div
					class="bg-primary-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
				>
					<Truck class="text-primary-600 h-4 w-4" />
				</div>
				<div><span class="font-semibold text-gray-900">Frete grátis</span> acima de R$ 150</div>
			</div>
			<div class="flex items-center gap-3 text-sm text-gray-600">
				<div
					class="bg-primary-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
				>
					<ShieldCheck class="text-primary-600 h-4 w-4" />
				</div>
				<div>
					<span class="font-semibold text-gray-900">Produtos originais</span> com nota fiscal
				</div>
			</div>
			<div class="flex items-center gap-3 text-sm text-gray-600">
				<div
					class="bg-primary-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
				>
					<RotateCcw class="text-primary-600 h-4 w-4" />
				</div>
				<div><span class="font-semibold text-gray-900">Troca fácil</span> em até 30 dias</div>
			</div>
		</div>
	</div>
</div>

<!-- Loja -->
<section class="section bg-gray-50">
	<div class="container-app">
		<div class="flex flex-col gap-8 lg:flex-row">
			<!-- Sidebar de filtros -->
			<aside class="w-full shrink-0 lg:w-56">
				<div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
					<div class="mb-4 flex items-center gap-2 font-semibold text-gray-900">
						<SlidersHorizontal class="h-4 w-4" />
						Categorias
					</div>
					<ul class="space-y-1">
						{#each allCategories as cat}
							<li>
								<button
									onclick={() => (selectedCategory = cat.id)}
									class={clsx(
										'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
										selectedCategory === cat.id
											? 'bg-primary-50 text-primary-700'
											: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
									)}
								>
									{cat.name}
								</button>
							</li>
						{/each}
					</ul>
				</div>
			</aside>

			<!-- Conteúdo principal -->
			<div class="w-0 min-w-0 flex-1">
				<!-- Barra de busca e ordenação -->
				<div
					class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
				>
					<div class="relative flex-1 sm:max-w-sm">
						<Search
							class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							placeholder="Buscar produtos..."
							bind:value={searchQuery}
							class="focus:border-primary-400 focus:ring-primary-100 w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm outline-none focus:ring-2"
						/>
					</div>
					<div class="flex items-center gap-2 text-sm">
						<span class="text-gray-500">Ordenar por:</span>
						<select
							bind:value={sortBy}
							class="focus:border-primary-400 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
						>
							<option value="relevancia">Relevância</option>
							<option value="menor-preco">Menor preço</option>
							<option value="maior-preco">Maior preço</option>
							<option value="avaliacao">Melhor avaliação</option>
						</select>
					</div>
				</div>

				<!-- Contador -->
				<p class="mb-4 text-sm text-gray-500">
					{filtered().length} produto{filtered().length !== 1 ? 's' : ''} encontrado{filtered()
						.length !== 1
						? 's'
						: ''}
				</p>

				<!-- Grid de produtos -->
				{#if filtered().length === 0}
					<div
						class="flex flex-col items-center justify-center py-20 text-center text-gray-400"
					>
						<span class="mb-3 text-5xl">🔍</span>
						<p class="font-medium">Nenhum produto encontrado</p>
						<p class="mt-1 text-sm">Tente outros termos ou selecione outra categoria.</p>
					</div>
				{:else}
					<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
						{#each filtered() as product (product.id)}
							<div
								class="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
							>
								<!-- Imagem — clicável para página do produto -->
								<a
									href="/store/produto/{product.slug}"
									class={clsx(
										'relative flex h-44 items-center justify-center rounded-t-2xl text-6xl',
										'from-primary-50 to-secondary-50 bg-linear-to-br overflow-hidden'
									)}
								>
									{#if product.image_url}
										<img
											src={product.image_url}
											alt={product.name}
											class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
										/>
									{:else}
										🐾
									{/if}
									{#if product.tag}
										<span
											class={clsx(
												'absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-semibold',
												product.tag === 'Oferta'
													? 'bg-red-100 text-red-600'
													: 'bg-primary-100 text-primary-700'
											)}
										>
											{product.tag}
										</span>
									{/if}
								</a>

								<!-- Info -->
								<div class="flex flex-1 flex-col p-4">
									<p
										class="mb-0.5 text-xs font-medium tracking-wide text-gray-400 uppercase"
									>
										{product.brand}
									</p>
									<a
										href="/store/produto/{product.slug}"
										class="leading-snug font-semibold text-gray-900 hover:text-primary-600 transition-colors"
									>
										{product.name}
									</a>
									<p class="mt-1.5 flex-1 text-xs leading-relaxed text-gray-500">
										{product.description}
									</p>

									<!-- Rating -->
									<div class="mt-3 flex items-center gap-1.5">
										<Star class="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
										<span class="text-xs font-medium text-gray-700">{product.rating}</span>
										<span class="text-xs text-gray-400">({product.review_count})</span>
									</div>

									<!-- Preço + CTA -->
									<div class="mt-3 flex items-end justify-between gap-2">
										<div>
											{#if product.original_price}
												<p class="text-xs text-gray-400 line-through">
													{formatPrice(product.original_price)}
												</p>
											{/if}
											<p class="text-lg font-bold text-gray-900">
												{formatPrice(product.price)}
											</p>
										</div>
										{#if product.stock_quantity > 0}
											<button
												onclick={() => addToCart(product)}
												class={clsx(
													'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
													'bg-primary-500 hover:bg-primary-600 text-white'
												)}
											>
												<Plus class="h-4 w-4" />
												Adicionar
											</button>
										{:else}
											<span
												class="rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-400"
											>
												Indisponível
											</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
