<script lang="ts">
	import { clsx } from 'clsx';
	import type { AppointmentFull } from '$lib/types';
	import {
		formatDateTime,
		formatCurrency,
		formatAppointmentStatus,
		getStatusColor
	} from '$lib/utils';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { SERVICES_CONFIG } from '$lib/config/services.config';

	interface Props {
		appointment: AppointmentFull;
		oncancel?: (id: string) => void;
	}

	let { appointment, oncancel }: Props = $props();

	const config = $derived(SERVICES_CONFIG.find((c) => c.slug === appointment.service_slug));
	const canCancel = $derived(
		appointment.status === 'pending' || appointment.status === 'confirmed'
	);
</script>

<div
	class={clsx(
		'rounded-2xl border border-gray-200 bg-white p-5',
		'shadow-sm transition-shadow hover:shadow-md',
	)}
>
	<div class="flex items-start justify-between gap-4">
		<div class="flex items-start gap-3">
			<div
				class={clsx(
					'flex h-12 w-12 shrink-0 items-center justify-center',
					'rounded-xl bg-primary-100 text-2xl',
				)}
			>
				{config?.emoji ?? '🐾'}
			</div>
			<div>
				<div class="font-semibold text-gray-900">{appointment.service_name}</div>
				<div class="mt-0.5 text-sm text-gray-500">
					{appointment.pet_name} · {appointment.pet_species}
				</div>
			</div>
		</div>

		<Badge color={getStatusColor(appointment.status)}>
			{formatAppointmentStatus(appointment.status)}
		</Badge>
	</div>

	<div class="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
		<div class="flex items-center gap-1.5">
			<span>📅</span>
			<span>{formatDateTime(appointment.scheduled_at)}</span>
		</div>
		{#if appointment.price_charged}
			<div class="flex items-center gap-1.5">
				<span>💰</span>
				<span>{formatCurrency(appointment.price_charged)}</span>
			</div>
		{/if}
	</div>

	{#if appointment.notes}
		<p class="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">{appointment.notes}</p>
	{/if}

	{#if canCancel && oncancel}
		<div class="mt-4 flex justify-end">
			<Button variant="danger" size="sm" onclick={() => oncancel(appointment.id)}>
				Cancelar agendamento
			</Button>
		</div>
	{/if}
</div>
