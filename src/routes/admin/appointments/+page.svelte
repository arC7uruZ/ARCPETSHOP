<script lang="ts">
	import { clsx } from 'clsx';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { formatDateTime } from '$lib/utils/date.utils';
	import type { AppointmentStatus } from '$lib/types';
	import { uiStore } from '$lib/stores/ui.store.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const statusColors: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800',
		confirmed: 'bg-blue-100 text-blue-800',
		in_progress: 'bg-purple-100 text-purple-800',
		completed: 'bg-green-100 text-green-800',
		cancelled: 'bg-red-100 text-red-800',
		no_show: 'bg-gray-100 text-gray-700'
	};

	const statusLabels: Record<string, string> = {
		pending: 'Pendente',
		confirmed: 'Confirmado',
		in_progress: 'Em andamento',
		completed: 'Concluído',
		cancelled: 'Cancelado',
		no_show: 'Não compareceu'
	};

	const statusOptions: { value: AppointmentStatus; label: string }[] = [
		{ value: 'pending', label: 'Pendente' },
		{ value: 'confirmed', label: 'Confirmado' },
		{ value: 'in_progress', label: 'Em andamento' },
		{ value: 'completed', label: 'Concluído' },
		{ value: 'cancelled', label: 'Cancelado' },
		{ value: 'no_show', label: 'Não compareceu' }
	];

	let selectedAppointment = $state<(typeof data.appointments)[0] | null>(null);
	let modalOpen = $state(false);
	let selectedStatus = $state<AppointmentStatus>('pending');
	let internalNotes = $state('');
	let updating = $state(false);

	function openModal(appt: (typeof data.appointments)[0]) {
		selectedAppointment = appt;
		selectedStatus = appt.status as AppointmentStatus;
		internalNotes = appt.internal_notes ?? '';
		modalOpen = true;
	}

	$effect(() => {
		if (form?.success) {
			modalOpen = false;
			uiStore.success('Agendamento atualizado com sucesso!');
		}
		if (form?.error) {
			uiStore.error(form.error);
		}
	});
</script>

<svelte:head>
	<title>Agendamentos — Admin ArcPetShop</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Agendamentos</h1>
			<p class="mt-1 text-sm text-gray-500">{data.appointments.length} resultado(s)</p>
		</div>
	</div>

	<!-- Filters -->
	<form
		method="GET"
		class={clsx(
			'flex flex-wrap gap-3',
			'rounded-2xl bg-white p-4 shadow-sm',
			'border border-gray-100'
		)}
	>
		<div class="min-w-36 flex-1">
			<label for="status-filter" class="mb-1 block text-xs font-medium text-gray-500">Status</label>
			<select
				id="status-filter"
				name="status"
				value={data.filters.status ?? ''}
				class={clsx(
					'w-full rounded-lg border border-gray-200',
					'px-3 py-2 text-sm',
					'focus:ring-primary-500 focus:ring-2 focus:outline-none'
				)}
			>
				<option value="">Todos</option>
				{#each statusOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>
		<div class="min-w-36 flex-1">
			<label for="date" class="mb-1 block text-xs font-medium text-gray-500">Data</label>
			<input
				id="date"
				type="date"
				name="date"
				value={data.filters.date ?? ''}
				class={clsx(
					'w-full rounded-lg border border-gray-200',
					'px-3 py-2 text-sm',
					'focus:ring-primary-500 focus:ring-2 focus:outline-none'
				)}
			/>
		</div>
		<div class="min-w-36 flex-1">
			<label for="caretaker" class="mb-1 block text-xs font-medium text-gray-500">Cuidador</label>
			<select
				id="caretaker"
				name="caretaker"
				value={data.filters.caretakerId ?? ''}
				class={clsx(
					'w-full rounded-lg border border-gray-200',
					'px-3 py-2 text-sm',
					'focus:ring-primary-500 focus:ring-2 focus:outline-none'
				)}
			>
				<option value="">Todos</option>
				{#each data.caretakers as c}
					<option value={c.id}>{c.name}</option>
				{/each}
			</select>
		</div>
		<div class="flex items-end gap-2">
			<button
				type="submit"
				class={clsx(
					'bg-primary-500 rounded-lg px-4 py-2',
					'text-sm font-medium text-white',
					'hover:bg-primary-600 transition-colors'
				)}
			>
				Filtrar
			</button>
			<a
				href="/admin/appointments"
				class={clsx(
					'rounded-lg border border-gray-200 px-4 py-2',
					'text-sm font-medium text-gray-600',
					'transition-colors hover:bg-gray-50'
				)}
			>
				Limpar
			</a>
		</div>
	</form>

	<!-- Table -->
	<div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
		{#if data.appointments.length === 0}
			<div class="py-16 text-center text-gray-400">
				<svg
					class="mx-auto mb-3 h-10 w-10"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<p>Nenhum agendamento encontrado</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase">
						<tr>
							<th class="px-6 py-3 text-left">Cliente / Pet</th>
							<th class="px-6 py-3 text-left">Serviço</th>
							<th class="hidden px-6 py-3 text-left md:table-cell">Cuidador</th>
							<th class="hidden px-6 py-3 text-left lg:table-cell">Data/Hora</th>
							<th class="px-6 py-3 text-left">Status</th>
							<th class="px-6 py-3 text-right">Ação</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-50">
						{#each data.appointments as appt}
							<tr class="transition-colors hover:bg-gray-50/50">
								<td class="px-6 py-4">
									<p class="font-medium text-gray-900">{appt.user_name}</p>
									<p class="text-xs text-gray-400">{appt.pet_name} ({appt.pet_species})</p>
								</td>
								<td class="px-6 py-4 text-gray-700">{appt.service_name}</td>
								<td class="hidden px-6 py-4 text-gray-500 md:table-cell">
									{appt.caretaker_name ?? '—'}
								</td>
								<td class="hidden px-6 py-4 text-gray-500 lg:table-cell">
									{formatDateTime(appt.scheduled_at)}
								</td>
								<td class="px-6 py-4">
									<span
										class={clsx(
											'rounded-full px-2.5 py-0.5 text-xs font-medium',
											statusColors[appt.status]
										)}
									>
										{statusLabels[appt.status]}
									</span>
								</td>
								<td class="px-6 py-4 text-right">
									<button
										onclick={() => openModal(appt)}
										class="text-primary-600 hover:text-primary-700 text-xs font-medium"
									>
										Gerenciar
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Modal de gerenciamento -->
{#if modalOpen && selectedAppointment}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-900">Gerenciar Agendamento</h2>
				<button
					aria-label="close-modal"
					onclick={() => (modalOpen = false)}
					class="text-gray-400 hover:text-gray-600"
				>
					<svg
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="mb-5 space-y-1.5 rounded-xl bg-gray-50 p-4">
				<p class="text-sm">
					<span class="font-medium">Cliente:</span>
					{selectedAppointment.user_name}
				</p>
				<p class="text-sm"><span class="font-medium">Pet:</span> {selectedAppointment.pet_name}</p>
				<p class="text-sm">
					<span class="font-medium">Serviço:</span>
					{selectedAppointment.service_name}
				</p>
				<p class="text-sm">
					<span class="font-medium">Data/Hora:</span>
					{formatDateTime(selectedAppointment.scheduled_at)}
				</p>
				{#if selectedAppointment.caretaker_name}
					<p class="text-sm">
						<span class="font-medium">Cuidador:</span>
						{selectedAppointment.caretaker_name}
					</p>
				{/if}
				{#if selectedAppointment.notes}
					<p class="text-sm">
						<span class="font-medium">Observações:</span>
						{selectedAppointment.notes}
					</p>
				{/if}
			</div>

			<form
				method="POST"
				action="?/updateStatus"
				use:enhance={() => {
					updating = true;
					return async ({ update }) => {
						await update({ reset: false });
						updating = false;
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="appointmentId" value={selectedAppointment.id} />

				<div>
					<label for="status" class="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
					<select
                        id="status"
						name="status"
						bind:value={selectedStatus}
						class={clsx(
							'w-full rounded-xl border border-gray-200',
							'px-3 py-2.5 text-sm',
							'focus:ring-primary-500 focus:ring-2 focus:outline-none'
						)}
					>
						{#each statusOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="notes" class="mb-1.5 block text-sm font-medium text-gray-700">Notas internas</label>
					<textarea
                        id="notes"
						name="internalNotes"
						bind:value={internalNotes}
						rows={3}
						placeholder="Observações visíveis apenas para administradores..."
						class={clsx(
							'w-full resize-none rounded-xl border border-gray-200',
							'px-3 py-2.5 text-sm',
							'focus:ring-primary-500 focus:ring-2 focus:outline-none'
						)}
					></textarea>
				</div>

				<div class="flex gap-3 pt-2">
					<button
						type="button"
						onclick={() => (modalOpen = false)}
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
						disabled={updating}
						class={clsx(
							'bg-primary-500 flex-1 rounded-xl py-2.5',
							'text-sm font-medium text-white',
							'hover:bg-primary-600 transition-colors disabled:opacity-60'
						)}
					>
						{updating ? 'Salvando...' : 'Salvar'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
