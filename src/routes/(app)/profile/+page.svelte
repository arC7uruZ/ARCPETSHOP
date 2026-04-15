<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { Pet } from '$lib/types';
	import { enhance } from '$app/forms';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import PetCard from '$lib/components/pets/PetCard.svelte';
	import PetForm from '$lib/components/pets/PetForm.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let petModal = $state(false);
	let editingPet = $state<Pet | null>(null);
	let deleteModal = $state(false);
	let petToDelete = $state<Pet | null>(null);
	let profileLoading = $state(false);
    let deletePetLoading = $state(false);

	$effect(() => {
		if (form?.success && form.action === 'profile') uiStore.success('Perfil atualizado!');
		if (form?.success && form.action === 'createPet') {
			uiStore.success('Pet adicionado com sucesso!');
			petModal = false;
		}
		if (form?.success && form.action === 'updatePet') {
			uiStore.success('Pet atualizado!');
			petModal = false;
			editingPet = null;
		}
		if (form?.success && form.action === 'deletePet') {
			uiStore.success('Pet removido.');
			deleteModal = false;
		}
	});

	function handleEditPet(pet: Pet) {
		editingPet = pet;
		petModal = true;
	}

	function handleDeletePet(pet: Pet) {
		petToDelete = pet;
		deleteModal = true;
	}
</script>

<svelte:head>
	<title>Meu Perfil — ArcPetShop</title>
</svelte:head>

<div class="from-primary-500 to-primary-600 bg-gradient-to-r pt-28 pb-20">
	<div class="container-app text-white">
		<h1 class="font-display text-3xl font-bold">Meu Perfil</h1>
		<p class="text-primary-100 mt-1">Gerencie suas informações e pets.</p>
	</div>
</div>

<div class="container-app -mt-10 pb-16">
	<div class="grid gap-8 lg:grid-cols-2">
		<!-- Profile form -->
		<div class="rounded-2xl bg-white p-6 shadow-md">
			<h2 class="mb-6 font-bold text-gray-900">Informações pessoais</h2>

			<form
				method="POST"
				action="?/updateProfile"
				use:enhance={() => {
					profileLoading = true;
					return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
						await update({ reset: false });
						profileLoading = false;
					};
				}}
				class="space-y-4"
			>
				{#if form?.error && form.action === 'profile'}
					<div class="rounded-xl bg-red-50 p-3 text-sm text-red-600">{form.error}</div>
				{/if}

				<Input
					name="full_name"
					label="Nome completo"
					value={data.profile?.full_name ?? ''}
					required
				/>
				<Input
					name="phone"
					type="tel"
					label="WhatsApp"
					placeholder="(11) 99999-9999"
					value={data.profile?.phone ?? ''}
				/>
				<Input
					name="address_street"
					label="Endereço"
					placeholder="Rua, número"
					value={data.profile?.address_street ?? ''}
				/>
				<div class="grid grid-cols-2 gap-4">
					<Input name="address_city" label="Cidade" value={data.profile?.address_city ?? ''} />
					<Input name="address_state" label="Estado" value={data.profile?.address_state ?? ''} />
				</div>
				<Input
					name="address_zip"
					label="CEP"
					placeholder="00000-000"
					value={data.profile?.address_zip ?? ''}
				/>

				<Button type="submit" variant="primary" size="md" loading={profileLoading}>
					Salvar alterações
				</Button>
			</form>
		</div>

		<!-- Pets -->
		<div class="rounded-2xl bg-white p-6 shadow-md">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="font-bold text-gray-900">Meus Pets</h2>
				<Button
					variant="primary"
					size="sm"
					onclick={() => {
						editingPet = null;
						petModal = true;
					}}
				>
					+ Adicionar pet
				</Button>
			</div>

			{#if data.pets.length === 0}
				<EmptyState
					title="Nenhum pet cadastrado"
					description="Adicione seu pet para agendar serviços."
					emoji="🐾"
				>
					{#snippet action()}
						<Button variant="primary" size="sm" onclick={() => (petModal = true)}>
							Adicionar pet
						</Button>
					{/snippet}
				</EmptyState>
			{:else}
				<div class="space-y-4">
					{#each data.pets as pet}
						<PetCard {pet} onedit={handleEditPet} ondelete={handleDeletePet} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Pet modal -->
<Modal
	bind:open={petModal}
	title={editingPet ? 'Editar pet' : 'Novo pet'}
	onclose={() => (editingPet = null)}
>
	<PetForm
		pet={editingPet}
		formAction={editingPet ? '?/updatePet' : '?/createPet'}
		form={form?.action === 'pet' ? form : null}
		oncancel={() => (petModal = false)}
	/>
</Modal>

<!-- Delete modal -->
<Modal bind:open={deleteModal} title="Remover pet">
	<p class="text-sm text-gray-600">
		Tem certeza que deseja remover <strong>{petToDelete?.name}</strong>? Você não poderá agendar
		serviços para este pet após a remoção.
	</p>

	{#snippet footer()}
		<Button variant="ghost" size="md" onclick={() => (deleteModal = false)}>Cancelar</Button>
		<form method="POST" action="?/deletePet"
				use:enhance={() => {
					deletePetLoading = true;
					return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
						await update();
						deletePetLoading = false;
					};
				}}
        >
			<input type="hidden" name="petId" value={petToDelete?.id ?? ''} />
			<Button type="submit" variant="danger" size="md" loading={deletePetLoading}>Remover pet</Button>
		</form>
	{/snippet}
</Modal>
