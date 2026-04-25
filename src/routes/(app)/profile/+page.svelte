<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { Pet, OrderStatus, AppointmentFull } from '$lib/types';
	import { enhance } from '$app/forms';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import PetCard from '$lib/components/pets/PetCard.svelte';
	import PetForm from '$lib/components/pets/PetForm.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import AvatarUpload from '$lib/components/ui/AvatarUpload.svelte';
	import AppointmentCard from '$lib/components/dashboard/AppointmentCard.svelte';
	import {
		User, PawPrint, ShoppingBag, Calendar,
		CheckCircle2, Clock, XCircle, Package, Truck, RotateCcw, ChevronRight
	} from 'lucide-svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	type Tab = 'profile' | 'pets' | 'appointments' | 'orders';
	let activeTab = $state<Tab>('profile');

	// pets
	let petModal = $state(false);
	let editingPet = $state<Pet | null>(null);
	let deleteModal = $state(false);
	let petToDelete = $state<Pet | null>(null);
	let deletePetLoading = $state(false);

	// profile
	let profileLoading = $state(false);
	let avatarLoading = $state(false);
	let hasNewAvatar = $state(false);

	// appointments
	let cancelModal = $state(false);
	let appointmentToCancel = $state<AppointmentFull | null>(null);
	let cancelLoading = $state(false);

	const upcoming = $derived(
		data.appointments.filter((a) => ['pending', 'confirmed', 'in_progress'].includes(a.status))
	);
	const history = $derived(
		data.appointments.filter((a) => ['completed', 'cancelled', 'no_show'].includes(a.status))
	);
	let appointmentTab = $state<'upcoming' | 'history'>('upcoming');

	$effect(() => {
		if (form?.success && form.action === 'avatar') {
			uiStore.success('Foto de perfil atualizada!');
			hasNewAvatar = false;
		}
		if (form?.success && form.action === 'profile') uiStore.success('Perfil atualizado!');
		if (form?.success && form.action === 'createPet') {
			uiStore.success('Pet adicionado com sucesso!');
			petModal = false;
		}
		if (form?.success && form.action === 'updatePet') {
			uiStore.success('Pet atualizado!');
			petModal = false;
			editingPet = null;
		}
		if (form?.success && form.action === 'deletePet') {
			uiStore.success('Pet removido.');
			deleteModal = false;
		}
		if (form?.success && form.action === 'cancelAppointment') {
			uiStore.success('Agendamento cancelado.');
			cancelModal = false;
		}
		if (form?.error && form.action === 'cancelAppointment') {
			uiStore.error('Erro ao cancelar agendamento.');
			cancelModal = false;
		}
	});

	function handleEditPet(pet: Pet) {
		editingPet = pet;
		petModal = true;
	}

	function handleDeletePet(pet: Pet) {
		petToDelete = pet;
		deleteModal = true;
	}

	function handleCancelAppointment(id: string) {
		appointmentToCancel = data.appointments.find((a) => a.id === id) ?? null;
		cancelModal = true;
	}

	function formatPrice(v: number) {
		return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	function formatDate(d: string) {
		return new Date(d).toLocaleDateString('pt-BR', {
			day: '2-digit', month: '2-digit', year: 'numeric'
		});
	}

	type StatusConfig = { label: string; color: string; bg: string; icon: typeof CheckCircle2 };

	function orderStatusConfig(status: OrderStatus): StatusConfig {
		switch (status) {
			case 'pending_payment': return { label: 'Aguardando pagamento', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock };
			case 'paid':            return { label: 'Pago',                 color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 };
			case 'processing':      return { label: 'Em processamento',     color: 'text-blue-700',    bg: 'bg-blue-50',    icon: Package };
			case 'shipped':         return { label: 'Enviado',              color: 'text-indigo-700',  bg: 'bg-indigo-50',  icon: Truck };
			case 'delivered':       return { label: 'Entregue',             color: 'text-green-700',   bg: 'bg-green-50',   icon: CheckCircle2 };
			case 'cancelled':       return { label: 'Cancelado',            color: 'text-red-700',     bg: 'bg-red-50',     icon: XCircle };
			case 'refunded':        return { label: 'Reembolsado',          color: 'text-gray-600',    bg: 'bg-gray-100',   icon: RotateCcw };
		}
	}

	const firstName = $derived(data.profile?.full_name?.split(' ')[0] ?? 'Tutor');

	const tabs: { id: Tab; label: string; icon: typeof User; count?: number }[] = $derived([
		{ id: 'profile',      label: 'Perfil',         icon: User },
		{ id: 'pets',         label: 'Pets',            icon: PawPrint,    count: data.pets.length || undefined },
		{ id: 'appointments', label: 'Agendamentos',    icon: Calendar,    count: upcoming.length || undefined },
		{ id: 'orders',       label: 'Pedidos',         icon: ShoppingBag, count: data.orders.length || undefined }
	]);
</script>

<svelte:head>
	<title>Minha Conta — ArcPetShop</title>
</svelte:head>

<div class="from-primary-500 to-primary-600 bg-linear-to-r pt-28 pb-20">
	<div class="container-app">
		<div class="flex items-center gap-4">
			{#if data.profile?.avatar_url}
				<img
					src={data.profile.avatar_url}
					alt="Foto de perfil"
					class="h-14 w-14 rounded-full object-cover ring-2 ring-white/40"
				/>
			{:else}
				<div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white">
					{firstName[0]?.toUpperCase() ?? '👤'}
				</div>
			{/if}
			<div class="text-white">
				<h1 class="font-display text-2xl font-bold">Olá, {firstName}!</h1>
				<p class="text-primary-100 mt-0.5 text-sm">Gerencie seu perfil, pets, agendamentos e pedidos.</p>
			</div>
		</div>
	</div>
</div>

<div class="container-app -mt-10 pb-16">
	<!-- Tab bar -->
	<div class="mb-6 flex gap-1 rounded-2xl bg-white p-1.5 shadow-md">
		{#each tabs as tab}
			<button
				onclick={() => (activeTab = tab.id)}
				class="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
					{activeTab === tab.id
					? 'bg-primary-500 text-white shadow-sm'
					: 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}"
			>
				<tab.icon class="h-4 w-4 shrink-0" />
				<span class="hidden sm:inline">{tab.label}</span>
				{#if tab.count}
					<span class="rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none
						{activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'}">
						{tab.count}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- ── Perfil ── -->
	{#if activeTab === 'profile'}
		<div class="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-md">
			<h2 class="mb-6 font-bold text-gray-900">Informações pessoais</h2>

			<form
				method="POST"
				action="?/uploadAvatar"
				enctype="multipart/form-data"
				use:enhance={() => {
					avatarLoading = true;
					return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
						await update({ reset: false });
						avatarLoading = false;
					};
				}}
				class="mb-6 flex flex-col items-center gap-4 rounded-xl bg-gray-50 p-5"
			>
				{#if form?.error && form.action === 'avatar'}
					<div class="w-full rounded-xl bg-red-50 p-3 text-sm text-red-600">{form.error}</div>
				{/if}
				<AvatarUpload
					currentUrl={data.profile?.avatar_url}
					name="avatar"
					size="lg"
					shape="circle"
					placeholder={data.profile?.full_name?.[0]?.toUpperCase() ?? '👤'}
					facing="user"
					bind:hasFile={hasNewAvatar}
				/>
				{#if hasNewAvatar}
					<Button type="submit" variant="primary" size="sm" loading={avatarLoading}>
						Salvar foto
					</Button>
				{/if}
			</form>

			<form
				method="POST"
				action="?/updateProfile"
				use:enhance={() => {
					profileLoading = true;
					return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
						await update({ reset: false });
						profileLoading = false;
					};
				}}
				class="space-y-4"
			>
				{#if form?.error && form.action === 'profile'}
					<div class="rounded-xl bg-red-50 p-3 text-sm text-red-600">{form.error}</div>
				{/if}

				<Input name="full_name" label="Nome completo" value={data.profile?.full_name ?? ''} required />
				<Input name="phone" type="tel" label="WhatsApp" placeholder="(11) 99999-9999" value={data.profile?.phone ?? ''} />
				<Input name="address_street" label="Endereço" placeholder="Rua, número" value={data.profile?.address_street ?? ''} />
				<div class="grid grid-cols-2 gap-4">
					<Input name="address_city" label="Cidade" value={data.profile?.address_city ?? ''} />
					<Input name="address_state" label="Estado" value={data.profile?.address_state ?? ''} />
				</div>
				<Input name="address_zip" label="CEP" placeholder="00000-000" value={data.profile?.address_zip ?? ''} />

				<Button type="submit" variant="primary" size="md" loading={profileLoading}>
					Salvar alterações
				</Button>
			</form>
		</div>
	{/if}

	<!-- ── Pets ── -->
	{#if activeTab === 'pets'}
		<div class="rounded-2xl bg-white p-6 shadow-md">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="font-bold text-gray-900">Meus Pets</h2>
				<Button variant="primary" size="sm" onclick={() => { editingPet = null; petModal = true; }}>
					+ Adicionar pet
				</Button>
			</div>

			{#if data.pets.length === 0}
				<EmptyState title="Nenhum pet cadastrado" description="Adicione seu pet para agendar serviços." emoji="🐾">
					{#snippet action()}
						<Button variant="primary" size="sm" onclick={() => (petModal = true)}>Adicionar pet</Button>
					{/snippet}
				</EmptyState>
			{:else}
				<div class="grid gap-4 sm:grid-cols-2">
					{#each data.pets as pet}
						<PetCard {pet} onedit={handleEditPet} ondelete={handleDeletePet} />
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- ── Agendamentos ── -->
	{#if activeTab === 'appointments'}
		<div class="rounded-2xl bg-white p-6 shadow-md">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="font-bold text-gray-900">Meus Agendamentos</h2>
				<Button variant="primary" size="sm" href="/booking">+ Agendar</Button>
			</div>

			<!-- Sub-tabs: Próximos / Histórico -->
			<div class="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
				<button
					class="flex-1 rounded-lg py-2 text-sm font-medium transition-colors
						{appointmentTab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
					onclick={() => (appointmentTab = 'upcoming')}
				>
					Próximos ({upcoming.length})
				</button>
				<button
					class="flex-1 rounded-lg py-2 text-sm font-medium transition-colors
						{appointmentTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
					onclick={() => (appointmentTab = 'history')}
				>
					Histórico ({history.length})
				</button>
			</div>

			{#if appointmentTab === 'upcoming'}
				{#if upcoming.length === 0}
					<EmptyState title="Nenhum agendamento" description="Você não tem agendamentos próximos." emoji="📅">
						{#snippet action()}
							<Button variant="primary" size="sm" href="/booking">Agendar agora</Button>
						{/snippet}
					</EmptyState>
				{:else}
					<div class="space-y-4">
						{#each upcoming as appointment}
							<AppointmentCard {appointment} oncancel={handleCancelAppointment} />
						{/each}
					</div>
				{/if}
			{:else if history.length === 0}
				<EmptyState title="Nenhum histórico" description="Seus agendamentos concluídos aparecerão aqui." emoji="📋" />
			{:else}
				<div class="space-y-4">
					{#each history as appointment}
						<AppointmentCard {appointment} />
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- ── Pedidos ── -->
	{#if activeTab === 'orders'}
		<div class="rounded-2xl bg-white p-6 shadow-md">
			<h2 class="mb-6 font-bold text-gray-900">Meus Pedidos</h2>

			{#if data.orders.length === 0}
				<EmptyState title="Nenhum pedido ainda" description="Seus pedidos da loja aparecerão aqui." emoji="🛍️">
					{#snippet action()}
						<a href="/store" class="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">
							Ir para a loja
						</a>
					{/snippet}
				</EmptyState>
			{:else}
				<div class="space-y-3">
					{#each data.orders as order}
						{@const cfg = orderStatusConfig(order.status)}
						<a
							href="/store/pedido/{order.id}"
							class="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
						>
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full {cfg.bg}">
								<cfg.icon class="h-5 w-5 {cfg.color}" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span class="font-mono text-sm font-semibold text-gray-800">
										#{order.id.slice(0, 8).toUpperCase()}
									</span>
									<span class="rounded-full px-2 py-0.5 text-xs font-medium {cfg.bg} {cfg.color}">
										{cfg.label}
									</span>
								</div>
								<p class="mt-0.5 text-xs text-gray-400">{formatDate(order.created_at)}</p>
							</div>
							<div class="flex items-center gap-2 shrink-0">
								<span class="font-semibold text-gray-900">{formatPrice(order.total)}</span>
								<ChevronRight class="h-4 w-4 text-gray-300 group-hover:text-primary-400 transition-colors" />
							</div>
						</a>
					{/each}
				</div>
				<div class="mt-6 text-center">
					<a href="/store" class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
						Continuar comprando →
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Pet modal -->
<Modal bind:open={petModal} title={editingPet ? 'Editar pet' : 'Novo pet'} onclose={() => (editingPet = null)}>
	<PetForm
		pet={editingPet}
		formAction={editingPet ? '?/updatePet' : '?/createPet'}
		form={form?.action === 'pet' ? form : null}
		oncancel={() => (petModal = false)}
	/>
</Modal>

<!-- Delete pet modal -->
<Modal bind:open={deleteModal} title="Remover pet">
	<p class="text-sm text-gray-600">
		Tem certeza que deseja remover <strong>{petToDelete?.name}</strong>? Você não poderá agendar
		serviços para este pet após a remoção.
	</p>
	{#snippet footer()}
		<Button variant="ghost" size="md" onclick={() => (deleteModal = false)}>Cancelar</Button>
		<form
			method="POST"
			action="?/deletePet"
			use:enhance={() => {
				deletePetLoading = true;
				return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
					await update();
					deletePetLoading = false;
				};
			}}
		>
			<input type="hidden" name="petId" value={petToDelete?.id ?? ''} />
			<Button type="submit" variant="danger" size="md" loading={deletePetLoading}>Remover pet</Button>
		</form>
	{/snippet}
</Modal>

<!-- Cancel appointment modal -->
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
				return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
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
