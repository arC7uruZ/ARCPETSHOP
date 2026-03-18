<script lang="ts">
	import type { Pet } from '$lib/types';
	import { formatSpecies, formatPetSize } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		pet: Pet;
		onedit?: (pet: Pet) => void;
		ondelete?: (pet: Pet) => void;
	}

	let { pet, onedit, ondelete }: Props = $props();

	const speciesEmoji: Record<string, string> = {
		dog: '🐕',
		cat: '🐈',
		bird: '🐦',
		rabbit: '🐇',
		other: '🐾'
	};
</script>

<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
	<div class="flex items-start gap-4">
		<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-3xl">
			{pet.avatar_url
				? ''
				: speciesEmoji[pet.species] ?? '🐾'}
		</div>

		<div class="flex-1">
			<div class="flex items-center justify-between">
				<h3 class="font-bold text-gray-900">{pet.name}</h3>
				<div class="flex gap-1">
					{#if onedit}
						<button
							onclick={() => onedit(pet)}
							class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
							aria-label="Editar pet"
						>
							✏️
						</button>
					{/if}
					{#if ondelete}
						<button
							onclick={() => ondelete(pet)}
							class="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
							aria-label="Remover pet"
						>
							🗑️
						</button>
					{/if}
				</div>
			</div>

			<p class="text-sm text-gray-500">
				{formatSpecies(pet.species)}
				{#if pet.breed} · {pet.breed}{/if}
			</p>

			<div class="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
				{#if pet.size}
					<span>📏 {formatPetSize(pet.size)}</span>
				{/if}
				{#if pet.weight_kg}
					<span>⚖️ {pet.weight_kg}kg</span>
				{/if}
				{#if pet.birth_date}
					<span>🎂 {new Date(pet.birth_date).toLocaleDateString('pt-BR')}</span>
				{/if}
			</div>
		</div>
	</div>

	{#if pet.notes}
		<p class="mt-3 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
			⚠️ {pet.notes}
		</p>
	{/if}
</div>
