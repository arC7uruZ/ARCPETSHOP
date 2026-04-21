<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData } from "./$types";
	import { Shield, Key, UserCheck, Plus, Trash2 } from "lucide-svelte";

	let { data }: { data: PageData } = $props();

	let selectedRoleId = $state<string | null>(null);
	let selectedUserId = $state<string | null>(null);

	const selectedRole = $derived(
		data.roles.find((r) => r.id === selectedRoleId) ?? null
	);

	const unassignedPermissions = $derived(
		selectedRole
			? data.allPermissions.filter(
					(p) => !selectedRole.permissions.includes(p.name)
				)
			: []
	);
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-bold text-gray-900">Roles & Permissões</h1>
		<p class="mt-1 text-sm text-gray-500">
			Gerencie quais permissões cada role possui e atribua roles extras a usuários.
		</p>
	</div>

	<!-- Roles e suas permissões -->
	<section class="space-y-4">
		<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-800">
			<Shield class="h-5 w-5" />
			Roles do sistema
		</h2>

		<div class="grid gap-4 md:grid-cols-2">
			{#each data.roles as role}
				<div
					class="rounded-xl border bg-white p-5 shadow-sm"
					class:ring-2={selectedRoleId === role.id}
					class:ring-primary-500={selectedRoleId === role.id}
				>
					<div class="mb-3 flex items-start justify-between">
						<div>
							<h3 class="font-semibold text-gray-900 capitalize">{role.name}</h3>
							{#if role.description}
								<p class="text-xs text-gray-500">{role.description}</p>
							{/if}
						</div>
						{#if role.is_system}
							<span
								class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
							>
								sistema
							</span>
						{/if}
					</div>

					<div class="mb-3 flex flex-wrap gap-1.5">
						{#if role.name === "root_admin"}
							<span
								class="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
							>
								acesso total
							</span>
						{:else if role.name === "admin"}
							<span
								class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
							>
								acesso total (exceto gerenciar admins)
							</span>
						{:else if role.permissions.length === 0}
							<span class="text-xs text-gray-400">sem permissões</span>
						{:else}
							{#each role.permissions as perm}
								<span
									class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
								>
									{perm}
								</span>
							{/each}
						{/if}
					</div>

					{#if role.name !== "root_admin" && role.name !== "admin"}
						<button
							onclick={() =>
								(selectedRoleId = selectedRoleId === role.id ? null : role.id)}
							class="text-xs text-gray-500 underline hover:text-gray-800"
						>
							{selectedRoleId === role.id
								? "Fechar edição"
								: "Editar permissões"}
						</button>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Painel de edição de permissões da role selecionada -->
		{#if selectedRole && selectedRole.name !== "root_admin" && selectedRole.name !== "admin"}
			<div class="rounded-xl border bg-gray-50 p-5">
				<h3 class="mb-4 flex items-center gap-2 font-semibold text-gray-800">
					<Key class="h-4 w-4" />
					Editar permissões de <span class="capitalize">{selectedRole.name}</span>
				</h3>

				<div class="grid gap-6 md:grid-cols-2">
					<!-- Permissões atribuídas -->
					<div>
						<p class="mb-2 text-sm font-medium text-gray-700">Atribuídas</p>
						<div class="space-y-1">
							{#each selectedRole.permissions as perm}
								{@const permObj = data.allPermissions.find((p) => p.name === perm)}
								{#if permObj}
									<form
										method="POST"
										action="?/removePermission"
										use:enhance
										class="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
									>
										<input type="hidden" name="roleId" value={selectedRole.id} />
										<input
											type="hidden"
											name="permissionId"
											value={permObj.id}
										/>
										<span class="text-gray-700">{perm}</span>
										<button
											type="submit"
											class="text-red-400 hover:text-red-600"
											title="Remover"
										>
											<Trash2 class="h-3.5 w-3.5" />
										</button>
									</form>
								{/if}
							{/each}
							{#if selectedRole.permissions.length === 0}
								<p class="text-xs text-gray-400">Nenhuma permissão atribuída.</p>
							{/if}
						</div>
					</div>

					<!-- Permissões disponíveis para adicionar -->
					<div>
						<p class="mb-2 text-sm font-medium text-gray-700">Disponíveis</p>
						<div class="space-y-1">
							{#each unassignedPermissions as perm}
								<form
									method="POST"
									action="?/assignPermission"
									use:enhance
									class="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
								>
									<input type="hidden" name="roleId" value={selectedRole.id} />
									<input type="hidden" name="permissionId" value={perm.id} />
									<div>
										<p class="text-gray-700">{perm.name}</p>
										{#if perm.description}
											<p class="text-xs text-gray-400">{perm.description}</p>
										{/if}
									</div>
									<button
										type="submit"
										class="text-green-500 hover:text-green-700"
										title="Adicionar"
									>
										<Plus class="h-3.5 w-3.5" />
									</button>
								</form>
							{/each}
							{#if unassignedPermissions.length === 0}
								<p class="text-xs text-gray-400">Todas as permissões já atribuídas.</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</section>

	<!-- Roles extras por usuário -->
	<section class="space-y-4">
		<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-800">
			<UserCheck class="h-5 w-5" />
			Roles extras por usuário
		</h2>
		<p class="text-sm text-gray-500">
			Além da role principal (em Usuários), você pode atribuir roles adicionais aqui.
		</p>

		<div class="rounded-xl border bg-white shadow-sm">
			<div class="border-b p-4">
				<select
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
					onchange={(e) =>
						(selectedUserId = (e.target as HTMLSelectElement).value || null)}
				>
					<option value="">Selecione um usuário...</option>
					{#each data.users as u}
						<option value={u.id}>{u.full_name} ({u.role})</option>
					{/each}
				</select>
			</div>

			{#if selectedUserId}
				<div class="p-4">
					<p class="mb-3 text-sm font-medium text-gray-700">
						Atribuir role extra
					</p>
					<form
						method="POST"
						action="?/assignUserRole"
						use:enhance
						class="flex gap-2"
					>
						<input type="hidden" name="userId" value={selectedUserId} />
						<select
							name="roleId"
							class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							{#each data.roles as role}
								<option value={role.id}>{role.name}</option>
							{/each}
						</select>
						<button
							type="submit"
							class="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
						>
							<Plus class="h-4 w-4" />
						</button>
					</form>
				</div>
			{/if}
		</div>
	</section>
</div>
