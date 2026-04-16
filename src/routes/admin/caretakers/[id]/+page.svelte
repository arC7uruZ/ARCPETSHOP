<script lang="ts">
	import { clsx } from 'clsx';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { DAY_NAMES } from '$lib/utils/date.utils';
	import type { CaretakerSchedule, CaretakerBlockedSlot } from '$lib/types';
	import { Plus, Trash2, Ban, X } from 'lucide-svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// svelte-ignore state_referenced_locally
	let selectedSpecialties = $state<string[]>(data.caretaker.specialties ?? []);
	let addScheduleOpen = $state(false);
	let blockSlotOpen = $state(false);
	let fullDayBlock = $state(true);
	let saving = $state(false);
	let removeScheduleTarget = $state<CaretakerSchedule | null>(null);
	let removeBlockTarget = $state<CaretakerBlockedSlot | null>(null);

	$effect(() => {
		selectedSpecialties = data.caretaker.specialties ?? [];
	});

	$effect(() => {
		if (form?.success) {
			if (form.action === 'update') uiStore.success('Cuidador atualizado!');
			else if (form.action === 'addSchedule') {
				addScheduleOpen = false;
				uiStore.success('Horário adicionado!');
			} else if (form.action === 'removeSchedule') {
				removeScheduleTarget = null;
				uiStore.success('Horário removido.');
			} else if (form.action === 'blockSlot') {
				blockSlotOpen = false;
				uiStore.success('Bloqueio adicionado!');
			} else if (form.action === 'removeBlock') {
				removeBlockTarget = null;
				uiStore.success('Bloqueio removido.');
			} else if (form.action === 'toggleSchedule') uiStore.success('Horário atualizado.');
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

	function formatTime(time: string) {
		return time.slice(0, 5);
	}

	function formatDate(date: string) {
		return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR');
	}

	const dayOptions = DAY_NAMES.map((name, i) => ({ value: i, label: name }));

	const inputClass = clsx(
		'w-full rounded-xl border border-gray-200',
		'px-3 py-2.5 text-sm',
		'focus:outline-none focus:ring-2 focus:ring-primary-500'
	);
	const modalCancelClass = clsx(
		'flex-1 rounded-xl border border-gray-200 py-2.5',
		'text-sm font-medium text-gray-700',
		'hover:bg-gray-50 transition-colors'
	);
</script>

<svelte:head>
	<title>{data.caretaker.name} — Admin ArcPetShop</title>
</svelte:head>

<div class="max-w-4xl space-y-6">
	<!-- Breadcrumb -->
	<div class="flex items-center gap-2 text-sm text-gray-500">
		<a href="/admin/caretakers" class="hover:text-primary-600">Cuidadores</a>
		<span>/</span>
		<span class="font-medium text-gray-900">{data.caretaker.name}</span>
	</div>

	<!-- Dados básicos -->
	<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
		<h2 class="mb-5 text-lg font-bold text-gray-900">Informações do cuidador</h2>

		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update({ reset: false });
					saving = false;
				};
			}}
			class="space-y-4"
		>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="name" class="mb-1.5 block text-sm font-medium text-gray-700">
						Nome <span class="text-red-500">*</span>
					</label>
					<input
						id="name"
						type="text"
						name="name"
						value={data.caretaker.name}
						required
						class={inputClass}
					/>
				</div>
				<div>
					<label class="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
					<div class="flex h-10 items-center gap-2">
						<span
							class={clsx(
								'rounded-full px-3 py-1 text-sm font-medium',
								data.caretaker.is_active
									? 'bg-green-100 text-green-700'
									: 'bg-gray-100 text-gray-500'
							)}
						>
							{data.caretaker.is_active ? 'Ativo' : 'Inativo'}
						</span>
					</div>
				</div>
			</div>

			<div>
				<label for="bio" class="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
				<textarea
					id="bio"
					name="bio"
					rows={3}
					placeholder="Descrição breve do cuidador..."
					class={clsx(inputClass, 'resize-none')}>{data.caretaker.bio ?? ''}</textarea
				>
			</div>

			<div>
				<p class="mb-2 block text-sm font-medium text-gray-700">Especialidades</p>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
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

			<div class="pt-2">
				<button
					type="submit"
					disabled={saving}
					class={clsx(
						'bg-primary-500 rounded-xl px-6 py-2.5',
						'text-sm font-medium text-white',
						'hover:bg-primary-600 transition-colors disabled:opacity-60'
					)}
				>
					{saving ? 'Salvando...' : 'Salvar alterações'}
				</button>
			</div>
		</form>
	</div>

	<!-- Agenda semanal -->
	<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
		<div class="mb-5 flex items-center justify-between">
			<div>
				<h2 class="text-lg font-bold text-gray-900">Agenda semanal</h2>
				<p class="mt-0.5 text-sm text-gray-500">Dias e horários de disponibilidade recorrente</p>
			</div>
			<button
				onclick={() => (addScheduleOpen = true)}
				class={clsx(
					'flex items-center gap-2',
					'border-primary-300 bg-primary-50 rounded-xl border px-3 py-2',
					'text-primary-700 text-sm font-medium',
					'hover:bg-primary-100 transition-colors'
				)}
			>
				<Plus class="h-4 w-4" />
				Adicionar
			</button>
		</div>

		{#if data.caretaker.schedules.length === 0}
			<p class="py-4 text-center text-sm text-gray-400 italic">Nenhum horário cadastrado</p>
		{:else}
			<div class="space-y-2">
				{#each data.caretaker.schedules as schedule}
					<div
						class={clsx(
							'flex items-center gap-4',
							'rounded-xl border border-gray-100 p-3',
							!schedule.is_active && 'opacity-50'
						)}
					>
						<div class="w-32 text-sm font-medium text-gray-700">
							{dayOptions[schedule.day_of_week]?.label}
						</div>
						<div class="flex-1 text-sm text-gray-600">
							{formatTime(schedule.start_time)} — {formatTime(schedule.end_time)}
						</div>
						<div class="flex items-center gap-2">
							<form method="POST" action="?/toggleSchedule" use:enhance>
								<input type="hidden" name="scheduleId" value={schedule.id} />
								<input type="hidden" name="isActive" value={String(!schedule.is_active)} />
								<button
									type="submit"
									class="text-xs text-gray-400 transition-colors hover:text-gray-600"
								>
									{schedule.is_active ? 'Pausar' : 'Ativar'}
								</button>
							</form>
							<button
								aria-label="remove-schedule"
								onclick={() => (removeScheduleTarget = schedule)}
								class="text-red-400 transition-colors hover:text-red-600"
							>
								<Trash2 class="h-4 w-4" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Bloqueios específicos -->
	<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
		<div class="mb-5 flex items-center justify-between">
			<div>
				<h2 class="text-lg font-bold text-gray-900">Bloqueios de datas</h2>
				<p class="mt-0.5 text-sm text-gray-500">Datas ou horários específicos indisponíveis</p>
			</div>
			<button
				onclick={() => (blockSlotOpen = true)}
				class={clsx(
					'flex items-center gap-2',
					'rounded-xl border border-orange-300 bg-orange-50 px-3 py-2',
					'text-sm font-medium text-orange-700',
					'transition-colors hover:bg-orange-100'
				)}
			>
				<Ban class="h-4 w-4" />
				Bloquear data
			</button>
		</div>

		{#if data.caretaker.blocked_slots.length === 0}
			<p class="py-4 text-center text-sm text-gray-400 italic">Nenhum bloqueio cadastrado</p>
		{:else}
			<div class="space-y-2">
				{#each data.caretaker.blocked_slots as block}
					<div
						class="flex items-center gap-4 rounded-xl border border-orange-100 bg-orange-50/50 p-3"
					>
						<div class="flex-1">
							<p class="text-sm font-medium text-gray-800">{formatDate(block.blocked_date)}</p>
							{#if block.start_time && block.end_time}
								<p class="text-xs text-gray-500">
									{formatTime(block.start_time)} — {formatTime(block.end_time)}
								</p>
							{:else}
								<p class="text-xs text-orange-600">Dia inteiro</p>
							{/if}
							{#if block.reason}
								<p class="mt-0.5 text-xs text-gray-400">{block.reason}</p>
							{/if}
						</div>
						<button
							aria-label="remove-target"
							onclick={() => (removeBlockTarget = block)}
							class="text-red-400 transition-colors hover:text-red-600"
						>
							<Trash2 class="h-4 w-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Modal adicionar horário -->
{#if addScheduleOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<div class="mb-5 flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-900">Adicionar horário</h2>
				<button
					aria-label="add-schedule"
					onclick={() => (addScheduleOpen = false)}
					class="text-gray-400 hover:text-gray-600"
				>
					<X class="h-5 w-5" />
				</button>
			</div>
			<form method="POST" action="?/addSchedule" use:enhance class="space-y-4">
				<div>
					<label for="day-of-week" class="mb-1.5 block text-sm font-medium text-gray-700"
						>Dia da semana</label
					>
					<select id="day-of-week" name="dayOfWeek" required class={inputClass}>
						{#each dayOptions as day}
							<option value={day.value}>{day.label}</option>
						{/each}
					</select>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="start-time" class="mb-1.5 block text-sm font-medium text-gray-700"
							>Início</label
						>
						<input id="start-time" type="time" name="startTime" required class={inputClass} />
					</div>
					<div>
						<label for="end-time" class="mb-1.5 block text-sm font-medium text-gray-700"
							>Término</label
						>
						<input id="end-time" type="time" name="endTime" required class={inputClass} />
					</div>
				</div>
				<div class="flex gap-3 pt-2">
					<button type="button" onclick={() => (addScheduleOpen = false)} class={modalCancelClass}
						>Cancelar</button
					>
					<button
						type="submit"
						class={clsx(
							'bg-primary-500 flex-1 rounded-xl py-2.5',
							'text-sm font-medium text-white',
							'hover:bg-primary-600 transition-colors'
						)}>Adicionar</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal bloquear data -->
{#if blockSlotOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<div class="mb-5 flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-900">Bloquear data</h2>
				<button
					aria-label="open-block-slot"
					onclick={() => (blockSlotOpen = false)}
					class="text-gray-400 hover:text-gray-600"
				>
					<X class="h-5 w-5" />
				</button>
			</div>
			<form method="POST" action="?/blockSlot" use:enhance class="space-y-4">
				<div>
					<label for="blocked-date" class="mb-1.5 block text-sm font-medium text-gray-700"
						>Data</label
					>
					<input
						id="blocked-date"
						type="date"
						name="blockedDate"
						required
						min={new Date().toISOString().split('T')[0]}
						class={inputClass}
					/>
				</div>
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input
						type="checkbox"
						name="fullDay"
						bind:checked={fullDayBlock}
						class="text-primary-500 focus:ring-primary-500 rounded"
					/>
					<span class="font-medium text-gray-700">Dia inteiro</span>
				</label>
				{#if !fullDayBlock}
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="startTime" class="mb-1.5 block text-sm font-medium text-gray-700"
								>Das</label
							>
							<input id="startTime" type="time" name="startTime" class={inputClass} />
						</div>
						<div>
							<label for="endTime" class="mb-1.5 block text-sm font-medium text-gray-700">Até</label
							>
							<input id="endTime" type="time" name="endTime" class={inputClass} />
						</div>
					</div>
				{/if}
				<div>
					<label for="reason" class="mb-1.5 block text-sm font-medium text-gray-700"
						>Motivo (opcional)</label
					>
					<input
						id="reason"
						type="text"
						name="reason"
						placeholder="Ex: Folga, feriado..."
						class={inputClass}
					/>
				</div>
				<div class="flex gap-3 pt-2">
					<button type="button" onclick={() => (blockSlotOpen = false)} class={modalCancelClass}
						>Cancelar</button
					>
					<button
						type="submit"
						class={clsx(
							'flex-1 rounded-xl bg-orange-500 py-2.5',
							'text-sm font-medium text-white',
							'transition-colors hover:bg-orange-600'
						)}>Bloquear</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Confirmar remoção de horário -->
{#if removeScheduleTarget}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<h2 class="mb-2 text-lg font-bold text-gray-900">Remover horário?</h2>
			<p class="mb-5 text-sm text-gray-500">
				{dayOptions[removeScheduleTarget.day_of_week]?.label}: {formatTime(
					removeScheduleTarget.start_time
				)} — {formatTime(removeScheduleTarget.end_time)}
			</p>
			<form method="POST" action="?/removeSchedule" use:enhance class="flex gap-3">
				<input type="hidden" name="scheduleId" value={removeScheduleTarget.id} />
				<button type="button" onclick={() => (removeScheduleTarget = null)} class={modalCancelClass}
					>Cancelar</button
				>
				<button
					type="submit"
					class={clsx(
						'flex-1 rounded-xl bg-red-500 py-2.5',
						'text-sm font-medium text-white',
						'transition-colors hover:bg-red-600'
					)}>Remover</button
				>
			</form>
		</div>
	</div>
{/if}

<!-- Confirmar remoção de bloqueio -->
{#if removeBlockTarget}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<h2 class="mb-2 text-lg font-bold text-gray-900">Remover bloqueio?</h2>
			<p class="mb-5 text-sm text-gray-500">
				{formatDate(removeBlockTarget.blocked_date)}
				{#if removeBlockTarget.start_time}— {formatTime(removeBlockTarget.start_time)} às {formatTime(
						removeBlockTarget.end_time ?? ''
					)}{:else}(dia inteiro){/if}
			</p>
			<form method="POST" action="?/removeBlock" use:enhance class="flex gap-3">
				<input type="hidden" name="blockId" value={removeBlockTarget.id} />
				<button type="button" onclick={() => (removeBlockTarget = null)} class={modalCancelClass}
					>Cancelar</button
				>
				<button
					type="submit"
					class={clsx(
						'flex-1 rounded-xl bg-red-500 py-2.5',
						'text-sm font-medium text-white',
						'transition-colors hover:bg-red-600'
					)}>Remover</button
				>
			</form>
		</div>
	</div>
{/if}
