<script lang="ts">
	import { clsx } from 'clsx';
	import type { Caretaker, Service } from '$lib/types';
	import { bookingStore } from '$lib/stores/booking.store.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-svelte';

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
			? caretakers.filter((c) => c.specialties.includes(bookingStore.selectedService!.id))
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
					class={clsx(
						'w-full rounded-xl border-2 p-4 text-left',
						'transition-all',
						bookingStore.selectedCaretaker?.id === caretaker.id
							? 'border-primary-500 bg-primary-50'
							: 'hover:border-primary-200 border-gray-200 hover:bg-gray-50'
					)}
				>
					<div class="flex items-start gap-3">
						<div
							class={clsx(
								'flex h-10 w-10 shrink-0 items-center justify-center',
								'rounded-full',
								'bg-primary-100 text-primary-700',
								'text-sm font-bold'
							)}
						>
							{caretaker.name.charAt(0).toUpperCase()}
						</div>
						<div class="min-w-0 flex-1">
							<p class="font-semibold text-gray-900">{caretaker.name}</p>
							{#if caretaker.bio}
								<p class="mt-0.5 line-clamp-2 text-sm text-gray-500">{caretaker.bio}</p>
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
							<CheckCircle2 class="text-primary-500 h-5 w-5 shrink-0" />
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/if}

	<div class="mt-6 flex justify-between">
		<Button variant="ghost" size="lg" onclick={() => bookingStore.prevStep()}>
			<ArrowLeft class="h-4 w-4" />
			Voltar
		</Button>
		<Button
			variant="primary"
			size="lg"
			disabled={!bookingStore.canProceedFromStep3}
			onclick={() => bookingStore.nextStep()}
		>
			Continuar
			<ArrowRight class="h-4 w-4" />
		</Button>
	</div>
</div>
