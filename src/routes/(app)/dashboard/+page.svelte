<script lang="ts">
	import { clsx } from 'clsx';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import type { AppointmentFull } from '$lib/types';
	import AppointmentCard from '$lib/components/dashboard/AppointmentCard.svelte';
	import PetCard from '$lib/components/pets/PetCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let cancelModal = $state(false);
	let appointmentToCancel = $state<AppointmentFull | null>(null);
	let activeTab = $state<'upcoming' | 'history'>('upcoming');
	let cancelLoading = $state(false);

	const upcoming = $derived(
		data.appointments.filter((a) => ['pending', 'confirmed', 'in_progress'].includes(a.status))
	);
	const history = $derived(
		data.appointments.filter((a) => ['completed', 'cancelled', 'no_show'].includes(a.status))
	);

	function handleCancel(id: string) {
		appointmentToCancel = data.appointments.find((a) => a.id === id) ?? null;
		cancelModal = true;
	}

	$effect(() => {
		if (form?.success) {
			uiStore.success('Agendamento cancelado com sucesso.');
			cancelModal = false;
		} else if (form?.error) {
			uiStore.error('Erro ao cancelar agendamento');
			cancelModal = false;
		}
	});
</script>

<svelte:head>
	<title>Minha Conta — ArcPetShop</title>
</svelte:head>

<!-- Header -->
<div class="from-primary-500 to-primary-600 bg-linear-to-r pt-28 pb-20">
	<div class="container-app">
		<div class="flex items-center gap-4">
			<div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-3xl">
				👤
			</div>
			<div class="text-white">
				<h1 class="font-display text-2xl font-bold">
					Olá, {data.profile?.full_name?.split(' ')[0] ?? 'Tutor'}!
				</h1>
				<p class="text-primary-100">Gerencie seus pets e agendamentos.</p>
			</div>
		</div>
	</div>
</div>

<div class="container-app -mt-10 pb-16">
	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Sidebar: pets -->
		<div class="lg:col-span-1">
			<div class="rounded-2xl bg-white p-6 shadow-md">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="font-bold text-gray-900">Meus Pets</h2>
					<Button variant="outline" size="sm" href="/profile">+ Adicionar</Button>
				</div>

				{#if data.pets.length === 0}
					<EmptyState
						title="Nenhum pet"
						description="Adicione seu primeiro pet para agendar serviços."
						emoji="🐾"
					>
						{#snippet action()}
							<Button variant="primary" size="sm" href="/profile">Adicionar pet</Button>
						{/snippet}
					</EmptyState>
				{:else}
					<div class="space-y-3">
						{#each data.pets as pet}
							<PetCard {pet} />
						{/each}
					</div>
				{/if}
			</div>

			<!-- Quick actions -->
			<div class="mt-4 rounded-2xl bg-white p-6 shadow-md">
				<h2 class="mb-4 font-bold text-gray-900">Ações rápidas</h2>
				<div class="space-y-2">
					<Button variant="primary" size="md" fullWidth href="/booking">📅 Novo agendamento</Button>
					<Button variant="outline" size="md" fullWidth href="/profile">👤 Editar perfil</Button>
					<form method="POST" action="/logout">
						<Button type="submit" variant="ghost" size="md" fullWidth>🚪 Sair</Button>
					</form>
				</div>
			</div>
		</div>

		<!-- Main: appointments -->
		<div class="lg:col-span-2">
			<div class="rounded-2xl bg-white p-6 shadow-md">
				<!-- Tabs -->
				<div class="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
					<button
						class={clsx(
							'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
							activeTab === 'upcoming'
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-500 hover:text-gray-700'
						)}
						onclick={() => (activeTab = 'upcoming')}
					>
						Próximos ({upcoming.length})
					</button>
					<button
						class={clsx(
							'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
							activeTab === 'history'
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-500 hover:text-gray-700'
						)}
						onclick={() => (activeTab = 'history')}
					>
						Histórico ({history.length})
					</button>
				</div>

				{#if activeTab === 'upcoming'}
					{#if upcoming.length === 0}
						<EmptyState
							title="Nenhum agendamento"
							description="Você não tem agendamentos próximos."
							emoji="📅"
						>
							{#snippet action()}
								<Button variant="primary" size="sm" href="/booking">Agendar agora</Button>
							{/snippet}
						</EmptyState>
					{:else}
						<div class="space-y-4">
							{#each upcoming as appointment}
								<AppointmentCard {appointment} oncancel={handleCancel} />
							{/each}
						</div>
					{/if}
				{:else if history.length === 0}
					<EmptyState
						title="Nenhum histórico"
						description="Seus agendamentos concluídos aparecerão aqui."
						emoji="📋"
					/>
				{:else}
					<div class="space-y-4">
						{#each history as appointment}
							<AppointmentCard {appointment} />
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Cancel modal -->
<Modal bind:open={cancelModal} title="Cancelar agendamento">
	<p class="text-sm text-gray-600">
		Tem certeza que deseja cancelar o agendamento de
		<strong>{appointmentToCancel?.service_name}</strong> para
		<strong>{appointmentToCancel?.pet_name}</strong>?
	</p>

	{#snippet footer()}
		<Button variant="ghost" size="md" onclick={() => (cancelModal = false)}>Manter</Button>
		<form
			method="POST"
			action="?/cancelAppointment"
			use:enhance={() => {
				cancelLoading = true;
				return async ({ update }) => {
					await update();
					cancelLoading = false;
				};
			}}
		>
			<input type="hidden" name="appointmentId" value={appointmentToCancel?.id ?? ''} />
			<Button type="submit" variant="danger" size="md" loading={cancelLoading}>
				Cancelar agendamento
			</Button>
		</form>
	{/snippet}
</Modal>
