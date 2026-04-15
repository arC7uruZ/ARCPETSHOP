<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import type { Caretaker } from '$lib/types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let createModalOpen = $state(false);
	let deleteTarget = $state<Caretaker | null>(null);
	let creating = $state(false);
	let selectedSpecialties = $state<string[]>([]);

	$effect(() => {
		if (form?.success) {
			if (form.action === 'create') {
				createModalOpen = false;
				selectedSpecialties = [];
				uiStore.success('Cuidador criado com sucesso!');
			} else if (form.action === 'delete') {
				deleteTarget = null;
				uiStore.success('Cuidador removido.');
			} else if (form.action === 'toggle') {
				uiStore.success('Status atualizado.');
			}
		}
		if (form?.error) uiStore.error(form.error);
	});

	function toggleSpecialty(serviceId: string) {
		if (selectedSpecialties.includes(serviceId)) {
			selectedSpecialties = selectedSpecialties.filter((s) => s !== serviceId);
		} else {
			selectedSpecialties = [...selectedSpecialties, serviceId];
		}
	}

	function getServiceName(serviceId: string) {
		return data.services.find((s) => s.id === serviceId)?.name ?? serviceId;
	}
</script>

<svelte:head>
	<title>Cuidadores — Admin ArcPetShop</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Cuidadores</h1>
			<p class="text-sm text-gray-500 mt-1">{data.caretakers.length} cuidador(es) cadastrado(s)</p>
		</div>
		<button
			onclick={() => { createModalOpen = true; selectedSpecialties = []; }}
			class="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			Novo cuidador
		</button>
	</div>

	{#if data.caretakers.length === 0}
		<div class="rounded-2xl bg-white border border-gray-100 py-16 text-center text-gray-400 shadow-sm">
			<svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
			<p class="font-medium">Nenhum cuidador cadastrado</p>
			<p class="text-sm mt-1">Clique em "Novo cuidador" para começar.</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.caretakers as caretaker}
				<div class="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm {!caretaker.is_active ? 'opacity-60' : ''}">
					<div class="flex items-start justify-between mb-3">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
								{caretaker.name.charAt(0).toUpperCase()}
							</div>
							<div>
								<p class="font-semibold text-gray-900">{caretaker.name}</p>
								<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {caretaker.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
									{caretaker.is_active ? 'Ativo' : 'Inativo'}
								</span>
							</div>
						</div>
					</div>

					{#if caretaker.bio}
						<p class="text-sm text-gray-500 mb-3 line-clamp-2">{caretaker.bio}</p>
					{/if}

					{#if caretaker.specialties.length > 0}
						<div class="flex flex-wrap gap-1.5 mb-4">
							{#each caretaker.specialties as serviceId}
								<span class="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
									{getServiceName(serviceId)}
								</span>
							{/each}
						</div>
					{:else}
						<p class="text-xs text-gray-400 mb-4 italic">Sem especialidades cadastradas</p>
					{/if}

					<div class="flex items-center gap-2">
						<a
							href="/admin/caretakers/{caretaker.id}"
							class="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Gerenciar
						</a>

						<form method="POST" action="?/toggleActive" use:enhance>
							<input type="hidden" name="id" value={caretaker.id} />
							<input type="hidden" name="isActive" value={String(!caretaker.is_active)} />
							<button
								type="submit"
								class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium {caretaker.is_active ? 'text-yellow-700 hover:bg-yellow-50' : 'text-green-700 hover:bg-green-50'} transition-colors"
							>
								{caretaker.is_active ? 'Desativar' : 'Ativar'}
							</button>
						</form>

						<button
							onclick={() => (deleteTarget = caretaker)}
							class="rounded-lg border border-gray-200 p-1.5 text-red-500 hover:bg-red-50 transition-colors"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal de criação -->
{#if createModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
		<div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between mb-5">
				<h2 class="text-lg font-bold text-gray-900">Novo Cuidador</h2>
				<button onclick={() => (createModalOpen = false)} class="text-gray-400 hover:text-gray-600">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					creating = true;
					return async ({ update }) => {
						await update({ reset: false });
						creating = false;
					};
				}}
				class="space-y-4"
			>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1.5">
						Nome <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						name="name"
						required
						placeholder="Nome do cuidador"
						class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
					<textarea
						name="bio"
						rows={3}
						placeholder="Descrição breve..."
						class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
					></textarea>
				</div>

				<div>
					<p class="block text-sm font-medium text-gray-700 mb-2">Especialidades</p>
					<div class="grid grid-cols-2 gap-2">
						{#each data.services as service}
							<label class="flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors {selectedSpecialties.includes(service.id) ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}">
								<input
									type="checkbox"
									name="specialties"
									value={service.id}
									checked={selectedSpecialties.includes(service.id)}
									onchange={() => toggleSpecialty(service.id)}
									class="rounded text-primary-500 focus:ring-primary-500"
								/>
								<span class="truncate">{service.name}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="flex gap-3 pt-2">
					<button
						type="button"
						onclick={() => (createModalOpen = false)}
						class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={creating}
						class="flex-1 rounded-xl bg-primary-500 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60 transition-colors"
					>
						{creating ? 'Criando...' : 'Criar cuidador'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Confirmação de exclusão -->
{#if deleteTarget}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<h2 class="text-lg font-bold text-gray-900 mb-2">Excluir cuidador?</h2>
			<p class="text-sm text-gray-500 mb-5">
				Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.
			</p>
			<form method="POST" action="?/delete" use:enhance class="flex gap-3">
				<input type="hidden" name="id" value={deleteTarget.id} />
				<button
					type="button"
					onclick={() => (deleteTarget = null)}
					class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
				>
					Cancelar
				</button>
				<button
					type="submit"
					class="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
				>
					Excluir
				</button>
			</form>
		</div>
	</div>
{/if}
