<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { formatDate } from '$lib/utils/date.utils';
	import type { UserRole } from '$lib/types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const roleLabels: Record<UserRole, string> = {
		customer: 'Cliente',
		admin: 'Administrador',
		root_admin: 'Super Admin'
	};

	const roleColors: Record<UserRole, string> = {
		customer: 'bg-gray-100 text-gray-600',
		admin: 'bg-blue-100 text-blue-700',
		root_admin: 'bg-purple-100 text-purple-700'
	};

	let search = $state('');

	const filteredUsers = $derived(
		search
			? data.users.filter(
					(u) =>
						u.full_name.toLowerCase().includes(search.toLowerCase()) ||
						(u.phone ?? '').includes(search)
				)
			: data.users
	);

	$effect(() => {
		if (form?.success) uiStore.success('Permissão atualizada!');
		if (form?.error) uiStore.error(form.error);
	});
</script>

<svelte:head>
	<title>Usuários — Admin ArcPetShop</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Usuários</h1>
			<p class="text-sm text-gray-500 mt-1">
				Gerencie roles e permissões. Total: {data.users.length}
			</p>
		</div>
	</div>

	<!-- Search -->
	<div class="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
		<div class="relative">
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<input
				type="text"
				bind:value={search}
				placeholder="Buscar por nome ou telefone..."
				class="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
			/>
		</div>
	</div>

	<!-- Table -->
	<div class="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
		{#if filteredUsers.length === 0}
			<div class="py-16 text-center text-gray-400">
				<p>Nenhum usuário encontrado</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
						<tr>
							<th class="px-6 py-3 text-left">Usuário</th>
							<th class="px-6 py-3 text-left hidden sm:table-cell">Telefone</th>
							<th class="px-6 py-3 text-left hidden md:table-cell">Cadastro</th>
							<th class="px-6 py-3 text-left">Role atual</th>
							<th class="px-6 py-3 text-left">Alterar role</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-50">
						{#each filteredUsers as user}
							<tr class="hover:bg-gray-50/50 transition-colors">
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex-shrink-0">
											{user.full_name.charAt(0).toUpperCase()}
										</div>
										<span class="font-medium text-gray-900 truncate max-w-32">{user.full_name}</span>
									</div>
								</td>
								<td class="px-6 py-4 text-gray-500 hidden sm:table-cell">
									{user.phone ?? '—'}
								</td>
								<td class="px-6 py-4 text-gray-500 hidden md:table-cell">
									{formatDate(user.created_at)}
								</td>
								<td class="px-6 py-4">
									<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {roleColors[user.role as UserRole]}">
										{roleLabels[user.role as UserRole]}
									</span>
								</td>
								<td class="px-6 py-4">
									<form method="POST" action="?/updateRole" use:enhance class="flex items-center gap-2">
										<input type="hidden" name="userId" value={user.id} />
										<select
											name="role"
											value={user.role}
											class="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
										>
											<option value="customer">Cliente</option>
											<option value="admin">Administrador</option>
											<option value="root_admin">Super Admin</option>
										</select>
										<button
											type="submit"
											class="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 transition-colors"
										>
											Salvar
										</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
