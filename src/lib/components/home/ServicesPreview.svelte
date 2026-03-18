<script lang="ts">
	import type { Service } from '$lib/types';
	import { formatCurrency, formatDuration } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { SERVICES_CONFIG } from '$lib/config/services.config';

	interface Props {
		services: Service[];
	}

	let { services }: Props = $props();

	const enriched = $derived(
		services.map((s) => ({
			...s,
			config: SERVICES_CONFIG.find((c) => c.slug === s.slug)
		}))
	);
</script>

<section class="section bg-gray-50">
	<div class="container-app">
		<div class="text-center">
			<h2 class="section-title">Nossos Serviços</h2>
			<p class="section-subtitle mx-auto max-w-2xl">
				Cuidamos do seu pet com amor e profissionalismo. Confira todos os nossos serviços
				especializados.
			</p>
		</div>

		<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each enriched as service}
				<Card hover padding="none" class="overflow-hidden group">
					<!-- Service image/icon header -->
					<div
						class="flex h-40 items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100"
					>
						<span class="text-6xl group-hover:scale-110 transition-transform duration-300">
							{service.config?.emoji ?? '🐾'}
						</span>
					</div>

					<div class="p-6">
						<h3 class="mb-2 text-lg font-bold text-gray-900">{service.name}</h3>
						<p class="mb-4 text-sm leading-relaxed text-gray-500">{service.short_desc}</p>

						<div class="mb-4 flex items-center justify-between text-sm">
							<span class="font-semibold text-primary-600">
								A partir de {formatCurrency(service.price_from)}
							</span>
							<span class="text-gray-400">
								{formatDuration(service.duration_min)}
							</span>
						</div>

						<Button variant="outline" size="sm" fullWidth href="/booking">
							Agendar
						</Button>
					</div>
				</Card>
			{/each}
		</div>

		<div class="mt-10 text-center">
			<Button variant="primary" size="lg" href="/services">
				Ver todos os serviços
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</Button>
		</div>
	</div>
</section>
