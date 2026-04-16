<script lang="ts">
	import { clsx } from 'clsx';
	import { siteConfig } from '$lib/config/site.config';
	import Button from '$lib/components/ui/Button.svelte';
	import { ShoppingCart, Search, SlidersHorizontal, Star, Tag, Truck, ShieldCheck, RotateCcw } from 'lucide-svelte';

	type Product = {
		id: number;
		name: string;
		brand: string;
		price: number;
		originalPrice?: number;
		rating: number;
		reviews: number;
		category: string;
		tag?: string;
		emoji: string;
		description: string;
	};

	const categories = [
		{ id: 'all', label: 'Todos' },
		{ id: 'alimentacao', label: 'Alimentação' },
		{ id: 'higiene', label: 'Higiene & Beleza' },
		{ id: 'brinquedos', label: 'Brinquedos' },
		{ id: 'acessorios', label: 'Acessórios' },
		{ id: 'saude', label: 'Saúde' }
	];

	const products: Product[] = [
		// Alimentação
		{
			id: 1,
			name: 'Ração Premium Adulto Frango',
			brand: 'Royal Canin',
			price: 189.9,
			originalPrice: 229.9,
			rating: 4.8,
			reviews: 312,
			category: 'alimentacao',
			tag: 'Oferta',
			emoji: '🥩',
			description: 'Fórmula balanceada para cães adultos de porte médio. Rico em proteínas e vitaminas.'
		},
		{
			id: 2,
			name: 'Ração Gatos Castrados',
			brand: 'Hills Science',
			price: 149.9,
			rating: 4.7,
			reviews: 198,
			category: 'alimentacao',
			emoji: '🐟',
			description: 'Desenvolvida para gatos castrados, controla o peso e protege o trato urinário.'
		},
		{
			id: 3,
			name: 'Petisco Natural Carne Seca',
			brand: 'Biofresh',
			price: 34.9,
			rating: 4.9,
			reviews: 87,
			category: 'alimentacao',
			tag: 'Novo',
			emoji: '🦴',
			description: 'Petisco 100% natural, sem conservantes. Ideal para recompensa e adestramento.'
		},
		{
			id: 4,
			name: 'Sachê Úmido para Gatos',
			brand: 'Whiskas',
			price: 4.9,
			rating: 4.5,
			reviews: 543,
			category: 'alimentacao',
			emoji: '🐱',
			description: 'Sachê com molho saboroso de atum. Complemento alimentar rico em nutrientes.'
		},
		// Higiene & Beleza
		{
			id: 5,
			name: 'Shampoo Hidratante para Cães',
			brand: 'PetSmell',
			price: 42.9,
			originalPrice: 55.0,
			rating: 4.6,
			reviews: 156,
			category: 'higiene',
			tag: 'Oferta',
			emoji: '🛁',
			description: 'Fórmula suave com óleos naturais. Deixa o pelo macio, brilhante e perfumado por dias.'
		},
		{
			id: 6,
			name: 'Condicionador Pelo Longo',
			brand: 'PetSmell',
			price: 38.9,
			rating: 4.5,
			reviews: 89,
			category: 'higiene',
			emoji: '✨',
			description: 'Desembaraça e hidrata pelos longos. Facilita a escovação e evita nós.'
		},
		{
			id: 7,
			name: 'Escova Removedora de Pelo',
			brand: 'FurFree',
			price: 59.9,
			rating: 4.8,
			reviews: 204,
			category: 'higiene',
			emoji: '🪮',
			description: 'Remove pelo solto com facilidade. Ergonômica e adequada para todos os tamanhos de pet.'
		},
		{
			id: 8,
			name: 'Kit Higiene Dental Pets',
			brand: 'OralPet',
			price: 29.9,
			rating: 4.4,
			reviews: 67,
			category: 'higiene',
			tag: 'Novo',
			emoji: '🦷',
			description: 'Kit com escova e pasta dental sabor carne. Previne tártaro e mau hálito.'
		},
		// Brinquedos
		{
			id: 9,
			name: 'Bola Interativa Anti-Tédio',
			brand: 'PlayPet',
			price: 49.9,
			rating: 4.7,
			reviews: 132,
			category: 'brinquedos',
			emoji: '🎾',
			description: 'Bola que libera petiscos ao rolar. Estimula o instinto natural e combate o sedentarismo.'
		},
		{
			id: 10,
			name: 'Arranhador para Gatos c/ Sisal',
			brand: 'KittyCat',
			price: 89.9,
			originalPrice: 110.0,
			rating: 4.6,
			reviews: 78,
			category: 'brinquedos',
			tag: 'Oferta',
			emoji: '🐾',
			description: 'Torre arranhadora com sisal natural e plataformas. Preserva seus móveis.'
		},
		{
			id: 11,
			name: 'Corda de Puxar para Cães',
			brand: 'TugPlay',
			price: 24.9,
			rating: 4.5,
			reviews: 91,
			category: 'brinquedos',
			emoji: '🪢',
			description: 'Corda resistente de algodão trançado. Fortalece dentes e distrai por horas.'
		},
		// Acessórios
		{
			id: 12,
			name: 'Coleira Antipulgas Refletiva',
			brand: 'SafePet',
			price: 79.9,
			rating: 4.8,
			reviews: 267,
			category: 'acessorios',
			emoji: '🔖',
			description: 'Coleira com tecnologia antipulgas e faixa refletiva para passeios noturnos seguros.'
		},
		{
			id: 13,
			name: 'Cama Ortopédica M',
			brand: 'SleepyPet',
			price: 139.9,
			originalPrice: 179.9,
			rating: 4.9,
			reviews: 183,
			category: 'acessorios',
			tag: 'Oferta',
			emoji: '🛏️',
			description: 'Espuma viscoelástica de alta densidade. Alivia articulações e proporciona sono profundo.'
		},
		{
			id: 14,
			name: 'Mochila Transportadora Pet',
			brand: 'TravelPaw',
			price: 169.9,
			rating: 4.7,
			reviews: 112,
			category: 'acessorios',
			tag: 'Novo',
			emoji: '🎒',
			description: 'Mochila ventilada com visor panorâmico. Aprovada por companhias aéreas.'
		},
		// Saúde
		{
			id: 15,
			name: 'Suplemento Articular Omega 3',
			brand: 'VetPlus',
			price: 64.9,
			rating: 4.7,
			reviews: 145,
			category: 'saude',
			emoji: '💊',
			description: 'Rico em EPA e DHA. Melhora a mobilidade articular e o brilho do pelo.'
		},
		{
			id: 16,
			name: 'Antipulgas Spot-On 3 doses',
			brand: 'Frontline',
			price: 119.9,
			rating: 4.9,
			reviews: 398,
			category: 'saude',
			emoji: '🛡️',
			description: 'Proteção por até 3 meses contra pulgas, carrapatos e mosquitos.'
		}
	];

	let selectedCategory = $state('all');
	let searchQuery = $state('');
	let sortBy = $state<'relevancia' | 'menor-preco' | 'maior-preco' | 'avaliacao'>('relevancia');

	const filtered = $derived(() => {
		let result = products;

		if (selectedCategory !== 'all') {
			result = result.filter((p) => p.category === selectedCategory);
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
</script>

<svelte:head>
	<title>Loja — {siteConfig.name}</title>
	<meta
		name="description"
		content="Encontre os melhores produtos para o seu pet. Rações, brinquedos, acessórios e muito mais."
	/>
</svelte:head>

<!-- Hero -->
<div class="from-primary-500 to-secondary-500 bg-linear-to-br pt-32 pb-16">
	<div class="container-app text-center text-white">
		<div
			class="bg-white/20 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-sm"
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
<div class="bg-white border-b border-gray-100">
	<div class="container-app">
		<div class="grid grid-cols-1 gap-4 py-6 sm:grid-cols-3">
			<div class="flex items-center gap-3 text-sm text-gray-600">
				<div class="bg-primary-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
					<Truck class="text-primary-600 h-4 w-4" />
				</div>
				<div>
					<span class="font-semibold text-gray-900">Frete grátis</span> acima de R$ 150
				</div>
			</div>
			<div class="flex items-center gap-3 text-sm text-gray-600">
				<div class="bg-primary-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
					<ShieldCheck class="text-primary-600 h-4 w-4" />
				</div>
				<div>
					<span class="font-semibold text-gray-900">Produtos originais</span> com nota fiscal
				</div>
			</div>
			<div class="flex items-center gap-3 text-sm text-gray-600">
				<div class="bg-primary-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
					<RotateCcw class="text-primary-600 h-4 w-4" />
				</div>
				<div>
					<span class="font-semibold text-gray-900">Troca fácil</span> em até 30 dias
				</div>
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
						{#each categories as cat}
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
									{cat.label}
								</button>
							</li>
						{/each}
					</ul>
				</div>
			</aside>

			<!-- Conteúdo principal -->
			<div class="w-0 min-w-0 flex-1">
				<!-- Barra de busca e ordenação -->
				<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div class="relative flex-1 sm:max-w-sm">
						<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Buscar produtos..."
							bind:value={searchQuery}
							class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
						/>
					</div>
					<div class="flex items-center gap-2 text-sm">
						<span class="text-gray-500">Ordenar por:</span>
						<select
							bind:value={sortBy}
							class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-400"
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
					{filtered().length} produto{filtered().length !== 1 ? 's' : ''} encontrado{filtered().length !== 1 ? 's' : ''}
				</p>

				<!-- Grid de produtos -->
				{#if filtered().length === 0}
					<div class="flex flex-col items-center justify-center py-20 text-center text-gray-400">
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
								<!-- Imagem / emoji placeholder -->
								<div
									class={clsx(
										'relative flex h-44 items-center justify-center rounded-t-2xl text-6xl',
										'from-primary-50 to-secondary-50 bg-linear-to-br'
									)}
								>
									{product.emoji}
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
								</div>

								<!-- Info -->
								<div class="flex flex-1 flex-col p-4">
									<p class="mb-0.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
										{product.brand}
									</p>
									<h3 class="font-semibold text-gray-900 leading-snug">{product.name}</h3>
									<p class="mt-1.5 flex-1 text-xs leading-relaxed text-gray-500">
										{product.description}
									</p>

									<!-- Rating -->
									<div class="mt-3 flex items-center gap-1.5">
										<Star class="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
										<span class="text-xs font-medium text-gray-700">{product.rating}</span>
										<span class="text-xs text-gray-400">({product.reviews})</span>
									</div>

									<!-- Preço + CTA -->
									<div class="mt-3 flex items-end justify-between gap-2">
										<div>
											{#if product.originalPrice}
												<p class="text-xs text-gray-400 line-through">
													{formatPrice(product.originalPrice)}
												</p>
											{/if}
											<p class="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
										</div>
										<button
											class={clsx(
												'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
												'bg-primary-500 hover:bg-primary-600 text-white'
											)}
										>
											<ShoppingCart class="h-4 w-4" />
											Comprar
										</button>
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
