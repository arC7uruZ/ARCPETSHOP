<script lang="ts">
	import { clsx } from 'clsx';
	import type { PageData } from './$types';
	import { formatDateTime } from '$lib/utils/date.utils';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

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
</script>

<svelte:head>
	<title>Dashboard — Admin ArcPetShop</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
		<p class="mt-1 text-sm text-gray-500">Visão geral do sistema</p>
	</div>

	<!-- Stats cards -->
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
		<div class="col-span-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
			<p class="text-sm text-gray-500">Hoje</p>
			<p class="mt-1 text-3xl font-bold text-gray-900">{data.stats.totalAppointmentsToday}</p>
			<p class="mt-1 text-xs text-gray-400">agendamentos</p>
		</div>
		<div class="col-span-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
			<p class="text-sm text-gray-500">Pendentes</p>
			<p class="mt-1 text-3xl font-bold text-yellow-600">{data.stats.pendingAppointments}</p>
			<p class="mt-1 text-xs text-gray-400">aguardando</p>
		</div>
		<div class="col-span-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
			<p class="text-sm text-gray-500">Confirmados</p>
			<p class="mt-1 text-3xl font-bold text-blue-600">{data.stats.confirmedAppointments}</p>
			<p class="mt-1 text-xs text-gray-400">agendamentos</p>
		</div>
		<div class="col-span-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
			<p class="text-sm text-gray-500">Clientes</p>
			<p class="mt-1 text-3xl font-bold text-gray-900">{data.stats.totalUsers}</p>
			<p class="mt-1 text-xs text-gray-400">cadastrados</p>
		</div>
		<div class="col-span-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
			<p class="text-sm text-gray-500">Cuidadores</p>
			<p class="mt-1 text-3xl font-bold text-primary-600">{data.stats.activeCaretakers}</p>
			<p class="mt-1 text-xs text-gray-400">ativos</p>
		</div>
	</div>

	<!-- Quick actions -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<a
			href="/admin/appointments"
			class={clsx(
				'flex items-center gap-4',
				'rounded-2xl bg-primary-500 p-5',
				'text-white shadow-sm',
				'hover:bg-primary-600 transition-colors',
			)}
		>
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</div>
			<div>
				<p class="font-semibold">Ver agendamentos</p>
				<p class="text-sm text-primary-100">Gerenciar todos</p>
			</div>
		</a>
		<a
			href="/admin/caretakers"
			class={clsx(
				'flex items-center gap-4',
				'rounded-2xl border border-gray-100 bg-white p-5 shadow-sm',
				'hover:border-primary-200 transition-colors',
			)}
		>
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
				<svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</div>
			<div>
				<p class="font-semibold text-gray-900">Cuidadores</p>
				<p class="text-sm text-gray-500">Gerenciar equipe</p>
			</div>
		</a>
		<a
			href="/admin/users"
			class={clsx(
				'flex items-center gap-4',
				'rounded-2xl border border-gray-100 bg-white p-5 shadow-sm',
				'hover:border-primary-200 transition-colors',
			)}
		>
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
				<svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
			</div>
			<div>
				<p class="font-semibold text-gray-900">Usuários</p>
				<p class="text-sm text-gray-500">Gerenciar acessos</p>
			</div>
		</a>
	</div>

	<!-- Recent appointments -->
	<div class="rounded-2xl border border-gray-100 bg-white shadow-sm">
		<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
			<h2 class="font-semibold text-gray-900">Agendamentos recentes</h2>
			<a href="/admin/appointments" class="text-sm font-medium text-primary-600 hover:text-primary-700">
				Ver todos →
			</a>
		</div>

		{#if data.recentAppointments.length === 0}
			<div class="py-12 text-center text-gray-400">
				<svg class="mx-auto mb-3 h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
				<p>Nenhum agendamento ainda</p>
			</div>
		{:else}
			<div class="divide-y divide-gray-50">
				{#each data.recentAppointments as appt}
					<div class="flex items-center gap-4 px-6 py-4">
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium text-gray-900">{appt.user_name}</p>
							<p class="truncate text-xs text-gray-500">{appt.pet_name} · {appt.service_name}</p>
						</div>
						<div class="hidden text-right sm:block">
							<p class="text-xs text-gray-500">{formatDateTime(appt.scheduled_at)}</p>
							{#if appt.caretaker_name}
								<p class="text-xs text-gray-400">{appt.caretaker_name}</p>
							{/if}
						</div>
						<span class={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[appt.status])}>
							{statusLabels[appt.status]}
						</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
