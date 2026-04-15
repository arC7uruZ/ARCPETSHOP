<script lang="ts">
	import type { Caretaker, Service } from '$lib/types';
	import { bookingStore } from '$lib/stores/booking.store.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		caretakers: Caretaker[];
		services: Service[];
	}

	let { caretakers, services }: Props = $props();

	function getServiceName(serviceId: string) {
		return services.find((s) => s.id === serviceId)?.name ?? serviceId;
	}

	// Filtra apenas os cuidadores que atendem o serviço selecionado
	const availableCaretakers = $derived(
		bookingStore.selectedService
			? caretakers.filter((c) =>
					c.specialties.includes(bookingStore.selectedService!.id)
				)
			: caretakers
	);
</script>

<div>
	<h2 class="mb-2 text-xl font-bold text-gray-900">Escolha o cuidador</h2>
	<p class="mb-6 text-sm text-gray-500">Selecione quem irá atender seu pet.</p>

	{#if availableCaretakers.length === 0}
		<div class="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
			Nenhum cuidador disponível para este serviço no momento. Entre em contato conosco.
		</div>
	{:else}
		<div class="space-y-3">
			{#each availableCaretakers as caretaker}
				<button
					type="button"
					onclick={() => bookingStore.setCaretaker(caretaker)}
					class="w-full rounded-xl border-2 p-4 text-left transition-all {bookingStore.selectedCaretaker?.id === caretaker.id
						? 'border-primary-500 bg-primary-50'
						: 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'}"
				>
					<div class="flex items-start gap-3">
						<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
							{caretaker.name.charAt(0).toUpperCase()}
						</div>
						<div class="min-w-0 flex-1">
							<p class="font-semibold text-gray-900">{caretaker.name}</p>
							{#if caretaker.bio}
								<p class="text-sm text-gray-500 mt-0.5 line-clamp-2">{caretaker.bio}</p>
							{/if}
							{#if caretaker.specialties.length > 0}
								<div class="mt-2 flex flex-wrap gap-1">
									{#each caretaker.specialties as sid}
										<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
											{getServiceName(sid)}
										</span>
									{/each}
								</div>
							{/if}
						</div>
						{#if bookingStore.selectedCaretaker?.id === caretaker.id}
							<svg class="h-5 w-5 flex-shrink-0 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
							</svg>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/if}

	<div class="mt-6 flex justify-between">
		<Button variant="ghost" size="lg" onclick={() => bookingStore.prevStep()}>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			Voltar
		</Button>
		<Button
			variant="primary"
			size="lg"
			disabled={!bookingStore.canProceedFromStep3}
			onclick={() => bookingStore.nextStep()}
		>
			Continuar
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7" />
			</svg>
		</Button>
	</div>
</div>
