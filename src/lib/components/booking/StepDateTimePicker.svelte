<script lang="ts">
	import { bookingStore } from '$lib/stores/booking.store.svelte';
	import { getAvailableTimeSlots, getMinBookingDate, getMaxBookingDate } from '$lib/utils/date.utils';
	import Button from '$lib/components/ui/Button.svelte';

	const minDate = getMinBookingDate();
	const maxDate = getMaxBookingDate();

	const availableSlots = $derived(
		bookingStore.selectedDate ? getAvailableTimeSlots(new Date(bookingStore.selectedDate)) : []
	);
</script>

<div>
	<h2 class="mb-2 text-xl font-bold text-gray-900">Escolha data e horário</h2>
	<p class="mb-6 text-sm text-gray-500">Selecione quando você quer trazer seu pet.</p>

	<div class="mb-6">
		<label for="booking-date" class="mb-1.5 block text-sm font-medium text-gray-700">
			Data do agendamento <span class="text-red-500">*</span>
		</label>
		<input
			id="booking-date"
			type="date"
			min={minDate}
			max={maxDate}
			value={bookingStore.selectedDate}
			oninput={(e) => bookingStore.setDate((e.target as HTMLInputElement).value)}
			class="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
		/>
	</div>

	{#if bookingStore.selectedDate}
		<div>
			<p class="mb-3 text-sm font-medium text-gray-700">Horários disponíveis</p>

			{#if availableSlots.length === 0}
				<p class="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
					Não há horários disponíveis para esta data. Por favor, escolha outro dia.
				</p>
			{:else}
				<div class="grid grid-cols-4 gap-2 sm:grid-cols-5">
					{#each availableSlots as slot}
						<button
							type="button"
							class="rounded-lg border-2 py-2 text-center text-sm font-medium transition-all {bookingStore.selectedTime ===
							slot
								? 'border-primary-500 bg-primary-500 text-white'
								: 'border-gray-200 text-gray-700 hover:border-primary-300'}"
							onclick={() => bookingStore.setTime(slot)}
						>
							{slot}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<div class="mt-6 flex justify-between">
		<Button variant="ghost" size="lg" onclick={() => bookingStore.prevStep()}>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			Voltar
		</Button>
		<Button
			variant="primary"
			size="lg"
			disabled={!bookingStore.canProceedFromStep3}
			onclick={() => bookingStore.nextStep()}
		>
			Continuar
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7" />
			</svg>
		</Button>
	</div>
</div>
