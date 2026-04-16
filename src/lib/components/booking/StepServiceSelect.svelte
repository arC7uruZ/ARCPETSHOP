<script lang="ts">
	import { clsx } from 'clsx';
	import type { Service } from '$lib/types';
	import { bookingStore } from '$lib/stores/booking.store.svelte';
	import { formatCurrency, formatDuration } from '$lib/utils';
	import { SERVICES_CONFIG } from '$lib/config/services.config';
	import Button from '$lib/components/ui/Button.svelte';
	import { ArrowRight } from 'lucide-svelte';

	interface Props {
		services: Service[];
	}

	let { services }: Props = $props();
</script>

<div>
	<h2 class="mb-2 text-xl font-bold text-gray-900">Escolha o serviço</h2>
	<p class="mb-6 text-sm text-gray-500">Selecione o serviço que deseja agendar para seu pet.</p>

	<div class="grid gap-3 sm:grid-cols-2">
		{#each services as service}
			{@const config = SERVICES_CONFIG.find((c) => c.slug === service.slug)}
			<button
				type="button"
				class={clsx(
					'group relative flex items-start gap-4',
					'rounded-xl border-2 p-4 text-left',
					'transition-all',
					bookingStore.selectedService?.id === service.id
						? 'border-primary-500 bg-primary-50'
						: 'hover:border-primary-300 border-gray-200 hover:bg-gray-50'
				)}
				onclick={() => bookingStore.setService(service)}
			>
				{#if bookingStore.selectedService?.id === service.id}
					<div
						class={clsx(
							'bg-primary-500 absolute top-3 right-3 flex h-5 w-5',
							'items-center justify-center rounded-full text-xs text-white'
						)}
					>
						✓
					</div>
				{/if}

				<span class="mt-0.5 text-3xl">{config?.emoji ?? '🐾'}</span>
				<div class="min-w-0 flex-1">
					<div class="font-semibold text-gray-900">{service.name}</div>
					<div class="mt-0.5 text-xs text-gray-500">{service.short_desc}</div>
					<div class="mt-2 flex items-center gap-3 text-xs">
						<span class="text-primary-600 font-semibold">
							{formatCurrency(service.price_from)}
						</span>
						<span class="text-gray-400">·</span>
						<span class="text-gray-500">{formatDuration(service.duration_min)}</span>
					</div>
				</div>
			</button>
		{/each}
	</div>

	<div class="mt-6 flex justify-end">
		<Button
			variant="primary"
			size="lg"
			disabled={!bookingStore.canProceedFromStep1}
			onclick={() => bookingStore.nextStep()}
		>
			Continuar
			<ArrowRight class="h-4 w-4" />
		</Button>
	</div>
</div>
