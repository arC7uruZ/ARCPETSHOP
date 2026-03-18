<script lang="ts">
	import { bookingStore } from '$lib/stores/booking.store.svelte';
	import { formatCurrency, formatDuration, formatDateTime, formatSpecies } from '$lib/utils';
	import { SERVICES_CONFIG } from '$lib/config/services.config';
	import Button from '$lib/components/ui/Button.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';

	interface Props {
		loading?: boolean;
	}

	let { loading = false }: Props = $props();

	const serviceConfig = $derived(
		bookingStore.selectedService
			? SERVICES_CONFIG.find((c) => c.slug === bookingStore.selectedService!.slug)
			: null
	);

	const scheduledAtISO = $derived(
		bookingStore.selectedDate && bookingStore.selectedTime
			? `${bookingStore.selectedDate}T${bookingStore.selectedTime}:00`
			: ''
	);

	const rows = $derived([
		{
			label: 'Serviço',
			value: bookingStore.selectedService?.name,
			emoji: serviceConfig?.emoji ?? '🐾'
		},
		{
			label: 'Pet',
			value: bookingStore.selectedPet
				? `${bookingStore.selectedPet.name} (${formatSpecies(bookingStore.selectedPet.species)})`
				: '',
			emoji: '🐾'
		},
		{
			label: 'Data e hora',
			value: scheduledAtISO ? formatDateTime(scheduledAtISO) : '',
			emoji: '📅'
		},
		{
			label: 'Duração',
			value: bookingStore.selectedService
				? formatDuration(bookingStore.selectedService.duration_min)
				: '',
			emoji: '⏱️'
		},
		{
			label: 'Valor',
			value: bookingStore.selectedService
				? `A partir de ${formatCurrency(bookingStore.selectedService.price_from)}`
				: '',
			emoji: '💰'
		}
	]);
</script>

<div>
	<h2 class="mb-2 text-xl font-bold text-gray-900">Confirme seu agendamento</h2>
	<p class="mb-6 text-sm text-gray-500">Revise os detalhes antes de confirmar.</p>

	<div class="mb-6 divide-y divide-gray-100 rounded-xl border border-gray-200">
		{#each rows as row}
			{#if row.value}
				<div class="flex items-start gap-3 p-4">
					<span class="text-lg">{row.emoji}</span>
					<div class="flex-1">
						<div class="text-xs text-gray-500">{row.label}</div>
						<div class="font-medium text-gray-900">{row.value}</div>
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<Textarea
		name="notes"
		label="Observações (opcional)"
		placeholder="Alguma informação importante? Ex: meu pet tem ansiedade, alergia a determinado shampoo..."
		bind:value={bookingStore.notes}
		rows={3}
		maxlength={500}
	/>

	<div class="mt-6 flex justify-between">
		<Button variant="ghost" size="lg" onclick={() => bookingStore.prevStep()}>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			Voltar
		</Button>
		<Button type="submit" variant="primary" size="lg" {loading}>
			{#if loading}
				Agendando...
			{:else}
				✓ Confirmar agendamento
			{/if}
		</Button>
	</div>
</div>
