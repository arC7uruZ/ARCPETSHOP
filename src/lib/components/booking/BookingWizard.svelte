<script lang="ts">
	import { enhance } from '$app/forms';
	import { clsx } from 'clsx';
	import type { Service, Pet, Caretaker } from '$lib/types';
	import { bookingStore } from '$lib/stores/booking.store.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { combineDateAndTime } from '$lib/utils/date.utils';
	import StepServiceSelect from './StepServiceSelect.svelte';
	import StepPetSelect from './StepPetSelect.svelte';
	import StepCaretakerSelect from './StepCaretakerSelect.svelte';
	import StepDateTimePicker from './StepDateTimePicker.svelte';
	import StepConfirm from './StepConfirm.svelte';
	import BookingSuccess from './BookingSuccess.svelte';

	interface Props {
		services: Service[];
		pets: Pet[];
		caretakers: Caretaker[];
		form?: { error?: string; appointmentId?: string } | null;
	}

	let { services, pets, caretakers, form }: Props = $props();

	let loading = $state(false);
	let success = $state(false);

	const steps = ['Serviço', 'Pet', 'Cuidador', 'Data e Hora', 'Confirmação'];

	$effect(() => {
		if (form?.appointmentId) {
			success = true;
			bookingStore.reset();
		}
		if (form?.error) {
			uiStore.error(form.error);
		}
	});
</script>

{#if success}
	<BookingSuccess />
{:else}
	<div class="mx-auto max-w-2xl">
		<!-- Step indicator -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				{#each steps as _, i}
					<div class="flex flex-1 items-center">
						<div
							class={clsx(
								'flex items-center justify-center',
								'h-8 w-8',
								'rounded-full text-sm font-bold',
								'transition-colors',
								bookingStore.step > i + 1
									? 'bg-primary-500 text-white'
									: bookingStore.step === i + 1
										? 'bg-primary-500 ring-primary-100 text-white ring-4'
										: 'bg-gray-200 text-gray-500'
							)}
						>
							{#if bookingStore.step > i + 1}
								✓
							{:else}
								{i + 1}
							{/if}
						</div>
						{#if i < steps.length - 1}
							<div
								class={clsx(
									'mx-2 h-1 flex-1 rounded-full transition-colors',
									bookingStore.step > i + 1 ? 'bg-primary-500' : 'bg-gray-200'
								)}
							></div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="mt-2 flex justify-between text-xs text-gray-500">
				{#each steps as step}
					<span class="text-center">{step}</span>
				{/each}
			</div>
		</div>

		<!-- Step content -->
		<div class="rounded-2xl bg-white p-6 shadow-md sm:p-8">
			{#if bookingStore.step === 1}
				<StepServiceSelect {services} />
			{:else if bookingStore.step === 2}
				<StepPetSelect {pets} />
			{:else if bookingStore.step === 3}
				<StepCaretakerSelect {caretakers} {services} />
			{:else if bookingStore.step === 4}
				<StepDateTimePicker />
			{:else if bookingStore.step === 5}
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						loading = true;
						return async ({
							update
						}: {
							update: (opts?: { reset?: boolean }) => Promise<void>;
						}) => {
							await update({ reset: false });
							loading = false;
						};
					}}
				>
					<input type="hidden" name="serviceId" value={bookingStore.selectedService?.id ?? ''} />
					<input type="hidden" name="petId" value={bookingStore.selectedPet?.id ?? ''} />
					<input
						type="hidden"
						name="caretakerId"
						value={bookingStore.selectedCaretaker?.id ?? ''}
					/>
					<input
						type="hidden"
						name="scheduledAt"
						value={combineDateAndTime(bookingStore.selectedDate, bookingStore.selectedTime)}
					/>
					<input type="hidden" name="notes" value={bookingStore.notes} />

					<StepConfirm {loading} />
				</form>
			{/if}
		</div>
	</div>
{/if}
