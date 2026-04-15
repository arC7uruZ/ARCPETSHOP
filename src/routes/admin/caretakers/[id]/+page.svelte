<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { DAY_NAMES } from '$lib/server/caretakers.server';
	import type { CaretakerSchedule, CaretakerBlockedSlot } from '$lib/types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

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
			else if (form.action === 'addSchedule') { addScheduleOpen = false; uiStore.success('Horário adicionado!'); }
			else if (form.action === 'removeSchedule') { removeScheduleTarget = null; uiStore.success('Horário removido.'); }
			else if (form.action === 'blockSlot') { blockSlotOpen = false; uiStore.success('Bloqueio adicionado!'); }
			else if (form.action === 'removeBlock') { removeBlockTarget = null; uiStore.success('Bloqueio removido.'); }
			else if (form.action === 'toggleSchedule') uiStore.success('Horário atualizado.');
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
</script>

<svelte:head>
	<title>{data.caretaker.name} — Admin ArcPetShop</title>
</svelte:head>

<div class="space-y-6 max-w-4xl">
	<!-- Breadcrumb -->
	<div class="flex items-center gap-2 text-sm text-gray-500">
		<a href="/admin/caretakers" class="hover:text-primary-600">Cuidadores</a>
		<span>/</span>
		<span class="text-gray-900 font-medium">{data.caretaker.name}</span>
	</div>

	<!-- Dados básicos -->
	<div class="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
		<h2 class="text-lg font-bold text-gray-900 mb-5">Informações do cuidador</h2>

		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => { await update({ reset: false }); saving = false; };
			}}
			class="space-y-4"
		>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1.5">
						Nome <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						name="name"
						value={data.caretaker.name}
						required
						class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
					<div class="flex items-center gap-2 h-10">
						<span class="rounded-full px-3 py-1 text-sm font-medium {data.caretaker.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
							{data.caretaker.is_active ? 'Ativo' : 'Inativo'}
						</span>
					</div>
				</div>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
				<textarea
					name="bio"
					rows={3}
					placeholder="Descrição breve do cuidador..."
					class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
				>{data.caretaker.bio ?? ''}</textarea>
			</div>

			<div>
				<p class="block text-sm font-medium text-gray-700 mb-2">Especialidades</p>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
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

			<div class="pt-2">
				<button
					type="submit"
					disabled={saving}
					class="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60 transition-colors"
				>
					{saving ? 'Salvando...' : 'Salvar alterações'}
				</button>
			</div>
		</form>
	</div>

	<!-- Agenda semanal -->
	<div class="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
		<div class="flex items-center justify-between mb-5">
			<div>
				<h2 class="text-lg font-bold text-gray-900">Agenda semanal</h2>
				<p class="text-sm text-gray-500 mt-0.5">Dias e horários de disponibilidade recorrente</p>
			</div>
			<button
				onclick={() => (addScheduleOpen = true)}
				class="flex items-center gap-2 rounded-xl border border-primary-300 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				Adicionar
			</button>
		</div>

		{#if data.caretaker.schedules.length === 0}
			<p class="text-sm text-gray-400 italic py-4 text-center">Nenhum horário cadastrado</p>
		{:else}
			<div class="space-y-2">
				{#each data.caretaker.schedules as schedule}
					<div class="flex items-center gap-4 rounded-xl border border-gray-100 p-3 {!schedule.is_active ? 'opacity-50' : ''}">
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
								<button type="submit" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">
									{schedule.is_active ? 'Pausar' : 'Ativar'}
								</button>
							</form>
							<button
								onclick={() => (removeScheduleTarget = schedule)}
								class="text-red-400 hover:text-red-600 transition-colors"
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

	<!-- Bloqueios específicos -->
	<div class="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
		<div class="flex items-center justify-between mb-5">
			<div>
				<h2 class="text-lg font-bold text-gray-900">Bloqueios de datas</h2>
				<p class="text-sm text-gray-500 mt-0.5">Datas ou horários específicos indisponíveis</p>
			</div>
			<button
				onclick={() => (blockSlotOpen = true)}
				class="flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
				</svg>
				Bloquear data
			</button>
		</div>

		{#if data.caretaker.blocked_slots.length === 0}
			<p class="text-sm text-gray-400 italic py-4 text-center">Nenhum bloqueio cadastrado</p>
		{:else}
			<div class="space-y-2">
				{#each data.caretaker.blocked_slots as block}
					<div class="flex items-center gap-4 rounded-xl border border-orange-100 bg-orange-50/50 p-3">
						<div class="flex-1">
							<p class="text-sm font-medium text-gray-800">{formatDate(block.blocked_date)}</p>
							{#if block.start_time && block.end_time}
								<p class="text-xs text-gray-500">{formatTime(block.start_time)} — {formatTime(block.end_time)}</p>
							{:else}
								<p class="text-xs text-orange-600">Dia inteiro</p>
							{/if}
							{#if block.reason}
								<p class="text-xs text-gray-400 mt-0.5">{block.reason}</p>
							{/if}
						</div>
						<button
							onclick={() => (removeBlockTarget = block)}
							class="text-red-400 hover:text-red-600 transition-colors"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Modal adicionar horário -->
{#if addScheduleOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-center justify-between mb-5">
				<h2 class="text-lg font-bold text-gray-900">Adicionar horário</h2>
				<button onclick={() => (addScheduleOpen = false)} class="text-gray-400 hover:text-gray-600">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<form method="POST" action="?/addSchedule" use:enhance class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1.5">Dia da semana</label>
					<select
						name="dayOfWeek"
						required
						class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
					>
						{#each dayOptions as day}
							<option value={day.value}>{day.label}</option>
						{/each}
					</select>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1.5">Início</label>
						<input
							type="time"
							name="startTime"
							required
							class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1.5">Término</label>
						<input
							type="time"
							name="endTime"
							required
							class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
					</div>
				</div>
				<div class="flex gap-3 pt-2">
					<button type="button" onclick={() => (addScheduleOpen = false)} class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
					<button type="submit" class="flex-1 rounded-xl bg-primary-500 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors">Adicionar</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal bloquear data -->
{#if blockSlotOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-center justify-between mb-5">
				<h2 class="text-lg font-bold text-gray-900">Bloquear data</h2>
				<button onclick={() => (blockSlotOpen = false)} class="text-gray-400 hover:text-gray-600">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<form method="POST" action="?/blockSlot" use:enhance class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1.5">Data</label>
					<input
						type="date"
						name="blockedDate"
						required
						min={new Date().toISOString().split('T')[0]}
						class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
					/>
				</div>
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input
						type="checkbox"
						name="fullDay"
						bind:checked={fullDayBlock}
						class="rounded text-primary-500 focus:ring-primary-500"
					/>
					<span class="font-medium text-gray-700">Dia inteiro</span>
				</label>
				{#if !fullDayBlock}
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1.5">Das</label>
							<input type="time" name="startTime" class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1.5">Até</label>
							<input type="time" name="endTime" class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
						</div>
					</div>
				{/if}
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1.5">Motivo (opcional)</label>
					<input
						type="text"
						name="reason"
						placeholder="Ex: Folga, feriado..."
						class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
					/>
				</div>
				<div class="flex gap-3 pt-2">
					<button type="button" onclick={() => (blockSlotOpen = false)} class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
					<button type="submit" class="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors">Bloquear</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Confirmar remoção de horário -->
{#if removeScheduleTarget}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<h2 class="text-lg font-bold text-gray-900 mb-2">Remover horário?</h2>
			<p class="text-sm text-gray-500 mb-5">
				{dayOptions[removeScheduleTarget.day_of_week]?.label}: {formatTime(removeScheduleTarget.start_time)} — {formatTime(removeScheduleTarget.end_time)}
			</p>
			<form method="POST" action="?/removeSchedule" use:enhance class="flex gap-3">
				<input type="hidden" name="scheduleId" value={removeScheduleTarget.id} />
				<button type="button" onclick={() => (removeScheduleTarget = null)} class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
				<button type="submit" class="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors">Remover</button>
			</form>
		</div>
	</div>
{/if}

<!-- Confirmar remoção de bloqueio -->
{#if removeBlockTarget}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<h2 class="text-lg font-bold text-gray-900 mb-2">Remover bloqueio?</h2>
			<p class="text-sm text-gray-500 mb-5">
				{formatDate(removeBlockTarget.blocked_date)}
				{#if removeBlockTarget.start_time}— {formatTime(removeBlockTarget.start_time)} às {formatTime(removeBlockTarget.end_time ?? '')}{:else}(dia inteiro){/if}
			</p>
			<form method="POST" action="?/removeBlock" use:enhance class="flex gap-3">
				<input type="hidden" name="blockId" value={removeBlockTarget.id} />
				<button type="button" onclick={() => (removeBlockTarget = null)} class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
				<button type="submit" class="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors">Remover</button>
			</form>
		</div>
	</div>
{/if}
