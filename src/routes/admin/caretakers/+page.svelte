<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import type { Caretaker, UserSearchResult } from '$lib/types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// Modal e estados gerais
	let modalOpen = $state(false);
	let deleteTarget = $state<Caretaker | null>(null);
	let searching = $state(false);
	let promoting = $state(false);

	// Fluxo de busca/seleção de usuário
	let searchQuery = $state('');
	let searchResults = $state<UserSearchResult[]>([]);
	let selectedUser = $state<UserSearchResult | null>(null);
	let selectedSpecialties = $state<string[]>([]);
	let noResults = $state(false);

	$effect(() => {
		if (!form) return;

		if (form.action === 'searchUsers') {
			if ('results' in form) {
				const results = form.results as UserSearchResult[];
				searchResults = results;
				noResults = results.length === 0;
			}
			if ('error' in form && form.error) uiStore.error(form.error as string);
            searching = false;
		}

		if ('success' in form && form.success) {
			if (form.action === 'promote') {
				closeModal();
				uiStore.success('Usuário promovido a cuidador!');
			} else if (form.action === 'delete') {
				deleteTarget = null;
				uiStore.success('Cuidador removido e usuário revertido a cliente.');
			} else if (form.action === 'toggle') {
				uiStore.success('Status atualizado.');
			}
		}

		if ('error' in form && form.error && form.action !== 'searchUsers') {
			uiStore.error(form.error as string);
		}
	});

	function openModal() {
		modalOpen = true;
		searchQuery = '';
		searchResults = [];
		selectedUser = null;
		selectedSpecialties = [];
		noResults = false;
	}

	function closeModal() {
		modalOpen = false;
		searchQuery = '';
		searchResults = [];
		selectedUser = null;
		selectedSpecialties = [];
		noResults = false;
	}

	function selectUser(user: UserSearchResult) {
		selectedUser = user;
		searchResults = [];
	}

	function clearSelection() {
		selectedUser = null;
		searchResults = [];
		noResults = false;
	}

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
			onclick={openModal}
			class="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			Adicionar cuidador
		</button>
	</div>

	{#if data.caretakers.length === 0}
		<div class="rounded-2xl bg-white border border-gray-100 py-16 text-center text-gray-400 shadow-sm">
			<svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
			<p class="font-medium">Nenhum cuidador cadastrado</p>
			<p class="text-sm mt-1">Clique em "Adicionar cuidador" para vincular um usuário.</p>
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
						{#if caretaker.user_id}
							<span class="text-xs text-blue-500 bg-blue-50 rounded-full px-2 py-0.5 font-medium">Conta vinculada</span>
						{/if}
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

<!-- Modal: adicionar cuidador via busca de usuário -->
{#if modalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
		<div class="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">

			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-100">
				<div>
					<h2 class="text-lg font-bold text-gray-900">Adicionar cuidador</h2>
					<p class="text-sm text-gray-500 mt-0.5">
						{#if !selectedUser}
							Busque um usuário cadastrado no site
						{:else}
							Configure o perfil de cuidador
						{/if}
					</p>
				</div>
				<button type="button" onclick={closeModal} aria-label="close-modal" class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Etapa 1: busca de usuário -->
			{#if !selectedUser}
				<div class="p-6 space-y-4">
					<form
						method="POST"
						action="?/searchUsers"
						use:enhance={() => {
							searching = true;
							noResults = false;
							return async ({ update }) => {
								await update({ reset: false });
								searching = false;
							};
						}}
						class="flex gap-2"
					>
						<input
							type="text"
							name="query"
							bind:value={searchQuery}
							placeholder="Nome do usuário..."
							minlength="2"
							required
							class="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
						<button
							type="submit"
							disabled={searching || searchQuery.length < 2}
							class="flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
						>
							{#if searching}
								<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
								</svg>
							{:else}
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
								</svg>
							{/if}
							Buscar
						</button>
					</form>

					<p class="text-xs text-gray-400">
						Somente usuários com conta ativa e sem função de cuidador aparecem na busca.
					</p>

					<!-- Resultados -->
					{#if searchResults.length > 0}
						<div class="space-y-2">
							{#each searchResults as user}
								<button
									type="button"
									onclick={() => selectUser(user)}
									class="w-full flex items-center gap-3 rounded-xl border border-gray-200 p-3 text-left hover:border-primary-400 hover:bg-primary-50 transition-colors"
								>
									<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
										{user.full_name.charAt(0).toUpperCase()}
									</div>
									<div class="min-w-0">
										<p class="font-medium text-gray-900 truncate">{user.full_name}</p>
										{#if user.phone}
											<p class="text-xs text-gray-400">{user.phone}</p>
										{/if}
									</div>
									<svg class="ml-auto h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
									</svg>
								</button>
							{/each}
						</div>
					{:else if noResults}
						<div class="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
							<svg class="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Nenhum usuário encontrado para "<strong>{searchQuery}</strong>"
						</div>
					{/if}
				</div>

			<!-- Etapa 2: configurar cuidador -->
			{:else}
				<form
					method="POST"
					action="?/promote"
					use:enhance={() => {
						promoting = true;
						return async ({ update }) => {
							await update({ reset: false });
							promoting = false;
						};
					}}
					class="p-6 space-y-5"
				>
					<input type="hidden" name="userId" value={selectedUser.id} />

					<!-- Usuário selecionado -->
					<div class="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4">
						<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-white font-bold text-sm">
							{selectedUser.full_name.charAt(0).toUpperCase()}
						</div>
						<div class="min-w-0 flex-1">
							<p class="font-semibold text-gray-900">{selectedUser.full_name}</p>
							{#if selectedUser.phone}
								<p class="text-xs text-gray-500">{selectedUser.phone}</p>
							{/if}
						</div>
						<button
							type="button"
							onclick={clearSelection}
							class="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
						>
							<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
							Trocar
						</button>
					</div>

					<!-- Bio -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
						<textarea
							name="bio"
							rows={3}
							placeholder="Descrição breve sobre o cuidador..."
							class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
						></textarea>
					</div>

					<!-- Especialidades -->
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

					<!-- Ações -->
					<div class="flex gap-3 pt-1">
						<button
							type="button"
							onclick={closeModal}
							class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={promoting}
							class="flex-1 rounded-xl bg-primary-500 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60 transition-colors"
						>
							{promoting ? 'Promovendo...' : 'Promover a cuidador'}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}

<!-- Confirmação de exclusão -->
{#if deleteTarget}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<h2 class="text-lg font-bold text-gray-900 mb-2">Remover cuidador?</h2>
			<p class="text-sm text-gray-500 mb-1">
				<strong>{deleteTarget.name}</strong> será removido dos cuidadores.
			</p>
			{#if deleteTarget.user_id}
				<p class="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-5">
					A conta deste usuário voltará ao papel de <strong>cliente</strong>.
				</p>
			{:else}
				<p class="text-sm text-gray-400 mb-5">Esta ação não pode ser desfeita.</p>
			{/if}
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
					Remover
				</button>
			</form>
		</div>
	</div>
{/if}
