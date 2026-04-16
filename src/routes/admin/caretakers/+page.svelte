<script lang="ts">
	import { clsx } from 'clsx';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import type { Caretaker, UserSearchResult } from '$lib/types';
	import { Plus, Users, Trash2, Search, Loader2, ChevronRight, X } from 'lucide-svelte';

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
			<p class="mt-1 text-sm text-gray-500">{data.caretakers.length} cuidador(es) cadastrado(s)</p>
		</div>
		<button
			onclick={openModal}
			class={clsx(
				'flex items-center gap-2',
				'bg-primary-500 rounded-xl px-4 py-2.5',
				'text-sm font-medium text-white',
				'hover:bg-primary-600 transition-colors'
			)}
		>
			<Plus class="h-4 w-4" />
			Adicionar cuidador
		</button>
	</div>

	{#if data.caretakers.length === 0}
		<div
			class="rounded-2xl border border-gray-100 bg-white py-16 text-center text-gray-400 shadow-sm"
		>
			<Users class="mx-auto mb-4 h-12 w-12" />
			<p class="font-medium">Nenhum cuidador cadastrado</p>
			<p class="mt-1 text-sm">Clique em "Adicionar cuidador" para vincular um usuário.</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.caretakers as caretaker}
				<div
					class={clsx(
						'rounded-2xl border border-gray-100 bg-white p-5 shadow-sm',
						!caretaker.is_active && 'opacity-60'
					)}
				>
					<div class="mb-3 flex items-start justify-between">
						<div class="flex items-center gap-3">
							<div
								class={clsx(
									'flex h-10 w-10 items-center justify-center',
									'bg-primary-100 rounded-full',
									'text-primary-700 text-sm font-bold'
								)}
							>
								{caretaker.name.charAt(0).toUpperCase()}
							</div>
							<div>
								<p class="font-semibold text-gray-900">{caretaker.name}</p>
								<span
									class={clsx(
										'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
										caretaker.is_active
											? 'bg-green-100 text-green-700'
											: 'bg-gray-100 text-gray-500'
									)}
								>
									{caretaker.is_active ? 'Ativo' : 'Inativo'}
								</span>
							</div>
						</div>
						{#if caretaker.user_id}
							<span class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-500"
								>Conta vinculada</span
							>
						{/if}
					</div>

					{#if caretaker.bio}
						<p class="mb-3 line-clamp-2 text-sm text-gray-500">{caretaker.bio}</p>
					{/if}

					{#if caretaker.specialties.length > 0}
						<div class="mb-4 flex flex-wrap gap-1.5">
							{#each caretaker.specialties as serviceId}
								<span class="bg-primary-50 text-primary-700 rounded-full px-2 py-0.5 text-xs">
									{getServiceName(serviceId)}
								</span>
							{/each}
						</div>
					{:else}
						<p class="mb-4 text-xs text-gray-400 italic">Sem especialidades cadastradas</p>
					{/if}

					<div class="flex items-center gap-2">
						<a
							href="/admin/caretakers/{caretaker.id}"
							class={clsx(
								'flex-1 rounded-lg border border-gray-200 py-1.5',
								'text-center text-xs font-medium text-gray-700',
								'transition-colors hover:bg-gray-50'
							)}
						>
							Gerenciar
						</a>

						<form method="POST" action="?/toggleActive" use:enhance>
							<input type="hidden" name="id" value={caretaker.id} />
							<input type="hidden" name="isActive" value={String(!caretaker.is_active)} />
							<button
								type="submit"
								class={clsx(
									'rounded-lg border border-gray-200 px-3 py-1.5',
									'text-xs font-medium transition-colors',
									caretaker.is_active
										? 'text-yellow-700 hover:bg-yellow-50'
										: 'text-green-700 hover:bg-green-50'
								)}
							>
								{caretaker.is_active ? 'Desativar' : 'Ativar'}
							</button>
						</form>

						<button
							aria-label="delete-caretaker"
							onclick={() => (deleteTarget = caretaker)}
							class="rounded-lg border border-gray-200 p-1.5 text-red-500 transition-colors hover:bg-red-50"
						>
							<Trash2 class="h-4 w-4" />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal: adicionar cuidador via busca de usuário -->
{#if modalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-100 p-6">
				<div>
					<h2 class="text-lg font-bold text-gray-900">Adicionar cuidador</h2>
					<p class="mt-0.5 text-sm text-gray-500">
						{#if !selectedUser}
							Busque um usuário cadastrado no site
						{:else}
							Configure o perfil de cuidador
						{/if}
					</p>
				</div>
				<button
					type="button"
					onclick={closeModal}
					aria-label="close-modal"
					class="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<!-- Etapa 1: busca de usuário -->
			{#if !selectedUser}
				<div class="space-y-4 p-6">
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
							class={clsx(
								'flex-1 rounded-xl border border-gray-200',
								'px-3 py-2.5 text-sm',
								'focus:ring-primary-500 focus:ring-2 focus:outline-none'
							)}
						/>
						<button
							type="submit"
							disabled={searching || searchQuery.length < 2}
							class={clsx(
								'flex items-center gap-1.5',
								'bg-primary-500 rounded-xl px-4 py-2.5',
								'text-sm font-medium text-white',
								'hover:bg-primary-600 transition-colors disabled:opacity-50'
							)}
						>
							{#if searching}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else}
								<Search class="h-4 w-4" />
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
									class={clsx(
										'flex w-full items-center gap-3',
										'rounded-xl border border-gray-200 p-3 text-left',
										'hover:border-primary-400 hover:bg-primary-50 transition-colors'
									)}
								>
									<div
										class={clsx(
											'flex h-9 w-9 flex-shrink-0 items-center justify-center',
											'rounded-full bg-gray-100',
											'text-sm font-semibold text-gray-600'
										)}
									>
										{user.full_name.charAt(0).toUpperCase()}
									</div>
									<div class="min-w-0">
										<p class="truncate font-medium text-gray-900">{user.full_name}</p>
										{#if user.phone}
											<p class="text-xs text-gray-400">{user.phone}</p>
										{/if}
									</div>
									<ChevronRight class="ml-auto h-4 w-4 shrink-0 text-gray-400" />
								</button>
							{/each}
						</div>
					{:else if noResults}
						<div
							class="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400"
						>
							<Search class="mx-auto mb-2 h-8 w-8" />
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
					class="space-y-5 p-6"
				>
					<input type="hidden" name="userId" value={selectedUser.id} />

					<!-- Usuário selecionado -->
					<div
						class="border-primary-200 bg-primary-50 flex items-center gap-3 rounded-xl border p-4"
					>
						<div
							class={clsx(
								'flex h-10 w-10 shrink-0 items-center justify-center',
								'bg-primary-500 rounded-full',
								'text-sm font-bold text-white'
							)}
						>
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
							class="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600"
						>
							<X class="h-3.5 w-3.5" />
							Trocar
						</button>
					</div>

					<!-- Bio -->
					<div>
						<label for="bio" class="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
						<textarea
                            id="bio"
							name="bio"
							rows={3}
							placeholder="Descrição breve sobre o cuidador..."
							class={clsx(
								'w-full resize-none rounded-xl border border-gray-200',
								'px-3 py-2.5 text-sm',
								'focus:ring-primary-500 focus:ring-2 focus:outline-none'
							)}
						></textarea>
					</div>

					<!-- Especialidades -->
					<div>
						<p class="mb-2 block text-sm font-medium text-gray-700">Especialidades</p>
						<div class="grid grid-cols-2 gap-2">
							{#each data.services as service}
								<label
									class={clsx(
										'flex cursor-pointer items-center gap-2',
										'rounded-lg border p-2.5 text-sm transition-colors',
										selectedSpecialties.includes(service.id)
											? 'border-primary-400 bg-primary-50'
											: 'border-gray-200 hover:border-gray-300'
									)}
								>
									<input
										type="checkbox"
										name="specialties"
										value={service.id}
										checked={selectedSpecialties.includes(service.id)}
										onchange={() => toggleSpecialty(service.id)}
										class="text-primary-500 focus:ring-primary-500 rounded"
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
							class={clsx(
								'flex-1 rounded-xl border border-gray-200 py-2.5',
								'text-sm font-medium text-gray-700',
								'transition-colors hover:bg-gray-50'
							)}
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={promoting}
							class={clsx(
								'bg-primary-500 flex-1 rounded-xl py-2.5',
								'text-sm font-medium text-white',
								'hover:bg-primary-600 transition-colors disabled:opacity-60'
							)}
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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<h2 class="mb-2 text-lg font-bold text-gray-900">Remover cuidador?</h2>
			<p class="mb-1 text-sm text-gray-500">
				<strong>{deleteTarget.name}</strong> será removido dos cuidadores.
			</p>
			{#if deleteTarget.user_id}
				<p class="mb-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-600">
					A conta deste usuário voltará ao papel de <strong>cliente</strong>.
				</p>
			{:else}
				<p class="mb-5 text-sm text-gray-400">Esta ação não pode ser desfeita.</p>
			{/if}
			<form method="POST" action="?/delete" use:enhance class="flex gap-3">
				<input type="hidden" name="id" value={deleteTarget.id} />
				<button
					type="button"
					onclick={() => (deleteTarget = null)}
					class={clsx(
						'flex-1 rounded-xl border border-gray-200 py-2.5',
						'text-sm font-medium text-gray-700',
						'transition-colors hover:bg-gray-50'
					)}
				>
					Cancelar
				</button>
				<button
					type="submit"
					class={clsx(
						'flex-1 rounded-xl bg-red-500 py-2.5',
						'text-sm font-medium text-white',
						'transition-colors hover:bg-red-600'
					)}
				>
					Remover
				</button>
			</form>
		</div>
	</div>
{/if}
