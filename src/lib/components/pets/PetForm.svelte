<script lang="ts">
	import type { Pet } from '$lib/types';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';

	interface Props {
		pet?: Pet | null;
		formAction?: string;
		oncancel?: () => void;
		form?: { error?: string; errors?: Record<string, string> } | null;
	}

	let { pet = null, formAction = '?/createPet', oncancel, form }: Props = $props();

    // svelte-ignore state_referenced_locally
	let name = $state(pet?.name ?? '');
    // svelte-ignore state_referenced_locally
	let species = $state(pet?.species ?? 'dog');
    // svelte-ignore state_referenced_locally
	let breed = $state(pet?.breed ?? '');
    // svelte-ignore state_referenced_locally
	let size = $state(pet?.size ?? '');
    // svelte-ignore state_referenced_locally
	let birthDate = $state(pet?.birth_date ?? '');
    // svelte-ignore state_referenced_locally
	let weightKg = $state(pet?.weight_kg?.toString() ?? '');
    // svelte-ignore state_referenced_locally
	let color = $state(pet?.color ?? '');
    // svelte-ignore state_referenced_locally
	let notes = $state(pet?.notes ?? '');
	let loading = $state(false);

	const speciesOptions = [
		{ value: 'dog', label: '🐕 Cachorro' },
		{ value: 'cat', label: '🐈 Gato' },
		{ value: 'bird', label: '🐦 Pássaro' },
		{ value: 'rabbit', label: '🐇 Coelho' },
		{ value: 'other', label: '🐾 Outro' }
	];

	const sizeOptions = [
		{ value: 'small', label: 'Pequeno (até 10kg)' },
		{ value: 'medium', label: 'Médio (10–25kg)' },
		{ value: 'large', label: 'Grande (25–45kg)' },
		{ value: 'extra_large', label: 'Extra grande (45kg+)' }
	];
</script>

<form
	method="POST"
	action={formAction}
	use:enhance={() => {
		loading = true;
		return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
			await update({ reset: false });
			loading = false;
		};
	}}
	class="space-y-4"
>
	{#if pet?.id}
		<input type="hidden" name="petId" value={pet.id} />
	{/if}

	{#if form?.error}
		<div class="rounded-xl bg-red-50 p-3 text-sm text-red-600">{form.error}</div>
	{/if}

	<div class="grid gap-4 sm:grid-cols-2">
		<Input
			name="name"
			label="Nome do pet"
			placeholder="Ex: Bob"
			bind:value={name}
			error={form?.errors?.name}
			required
		/>

		<Select name="species" label="Espécie" options={speciesOptions} bind:value={species} required />
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<Input name="breed" label="Raça" placeholder="Ex: Golden Retriever" bind:value={breed} />
		<Select
			name="size"
			label="Porte"
			options={sizeOptions}
			bind:value={size}
			placeholder="Selecione o porte"
		/>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<Input name="birth_date" type="date" label="Data de nascimento" bind:value={birthDate} />
		<Input
			name="weight_kg"
			type="number"
			label="Peso (kg)"
			placeholder="Ex: 5.5"
			step={0.1}
			min={0}
			bind:value={weightKg}
		/>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<Input name="color" label="Cor / pelagem" placeholder="Ex: Dourado" bind:value={color} />
	</div>

	<Textarea
		name="notes"
		label="Observações de saúde"
		placeholder="Alergias, medicamentos, condições especiais..."
		bind:value={notes}
		rows={3}
	/>

	<div class="flex justify-end gap-3">
		{#if oncancel}
			<Button type="button" variant="ghost" size="md" onclick={oncancel}>Cancelar</Button>
		{/if}
		<Button type="submit" variant="primary" size="md" {loading}>
			{loading ? 'Salvando...' : pet ? 'Salvar alterações' : 'Adicionar pet'}
		</Button>
	</div>
</form>
