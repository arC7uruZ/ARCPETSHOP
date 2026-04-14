<script lang="ts">
	import type { PageData } from './$types';
	import { formatCurrency, formatDuration } from '$lib/utils';
	import { SERVICES_CONFIG } from '$lib/config/services.config';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Serviços — ArcPetShop</title>
	<meta name="description" content="Conheça todos os nossos serviços para pets." />
</svelte:head>

<!-- Page header -->
<div class="from-primary-500 to-primary-600 bg-gradient-to-r pt-32 pb-20">
	<div class="container-app text-center text-white">
		<h1 class="font-display text-4xl font-bold sm:text-5xl">Nossos Serviços</h1>
		<p class="text-primary-100 mx-auto mt-4 max-w-2xl text-lg">
			Cuidamos do seu pet com excelência. Conheça todos os serviços que oferecemos.
		</p>
	</div>
</div>

<div class="container-app -mt-10 pb-20">
	<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
		{#each data.services as service}
			{@const config = SERVICES_CONFIG.find((c) => c.slug === service.slug)}
			<Card shadow="lg" padding="none" class="overflow-hidden">
				<!-- Header -->
				<div
					class="from-primary-100 to-secondary-100 flex h-48 flex-col items-center justify-center bg-gradient-to-br"
				>
					<span class="text-7xl">{config?.emoji ?? '🐾'}</span>
					<span class="font-display mt-3 text-xl font-bold text-gray-700">{service.name}</span>
				</div>

				<div class="p-6">
					<p class="mb-4 text-sm leading-relaxed text-gray-600">{service.description}</p>

					{#if config?.features}
						<ul class="mb-4 space-y-1.5">
							{#each config.features as feature}
								<li class="flex items-start gap-2 text-sm text-gray-600">
									<span class="mt-0.5 text-green-500">✓</span>
									{feature}
								</li>
							{/each}
						</ul>
					{/if}

					<div class="mb-5 flex items-center justify-between border-t border-gray-100 pt-4">
						<div>
							<div class="text-xs text-gray-500">A partir de</div>
							<div class="text-primary-600 text-lg font-bold">
								{formatCurrency(service.price_from)}
							</div>
						</div>
						<div class="text-right">
							<div class="text-xs text-gray-500">Duração</div>
							<div class="font-semibold text-gray-700">{formatDuration(service.duration_min)}</div>
						</div>
					</div>

					<Button variant="primary" size="md" fullWidth href="/booking">
						Agendar este serviço
					</Button>
				</div>
			</Card>
		{/each}
	</div>
</div>
