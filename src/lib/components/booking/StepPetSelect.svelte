<script lang="ts">
	import type { Pet } from '$lib/types';
	import { bookingStore } from '$lib/stores/booking.store.svelte';
	import { formatSpecies } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		pets: Pet[];
	}

	let { pets }: Props = $props();

	const speciesEmoji: Record<string, string> = {
		dog: '🐕',
		cat: '🐈',
		bird: '🐦',
		rabbit: '🐇',
		other: '🐾'
	};
</script>

<div>
	<h2 class="mb-2 text-xl font-bold text-gray-900">Selecione o pet</h2>
	<p class="mb-6 text-sm text-gray-500">Para qual pet é este serviço?</p>

	{#if pets.length === 0}
		<div class="rounded-xl bg-yellow-50 p-6 text-center">
			<div class="mb-3 text-4xl">🐾</div>
			<p class="mb-4 font-medium text-yellow-800">Você ainda não tem pets cadastrados.</p>
			<Button variant="primary" size="sm" href="/profile">Adicionar pet</Button>
		</div>
	{:else}
		<div class="grid gap-3 sm:grid-cols-2">
			{#each pets as pet}
				<button
					type="button"
					class="group flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all {bookingStore
						.selectedPet?.id === pet.id
						? 'border-primary-500 bg-primary-50'
						: 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}"
					onclick={() => bookingStore.setPet(pet)}
				>
					<div
						class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-2xl"
					>
						{speciesEmoji[pet.species] ?? '🐾'}
					</div>
					<div>
						<div class="font-semibold text-gray-900">{pet.name}</div>
						<div class="text-sm text-gray-500">
							{formatSpecies(pet.species)}
							{#if pet.breed}· {pet.breed}{/if}
						</div>
					</div>
					{#if bookingStore.selectedPet?.id === pet.id}
						<div class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
							✓
						</div>
					{/if}
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
			disabled={!bookingStore.canProceedFromStep2}
			onclick={() => bookingStore.nextStep()}
		>
			Continuar
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7" />
			</svg>
		</Button>
	</div>
</div>
