import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Appointment, AppointmentFull, AppointmentInsert } from '$lib/types';
import { error } from '@sveltejs/kit';
import { sendBookingConfirmation } from './twilio.server';
import logger from '$lib/server/logger';

const log = logger.child({ module: 'appointments.server' });

export async function fetchUserAppointments(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<AppointmentFull[]> {
	const { data, error: err } = await supabase
		.from('appointments_full')
		.select('*')
		.eq('user_id', userId)
		.order('scheduled_at', { ascending: false });

	if (err) throw error(500, err.message);
	return (data ?? []) as AppointmentFull[];
}

export async function fetchAppointmentById(
	supabase: SupabaseClient<Database>,
	id: string,
	userId: string
): Promise<AppointmentFull> {
	const { data, error: err } = await supabase
		.from('appointments_full')
		.select('*')
		.eq('id', id)
		.eq('user_id', userId)
		.single();

	if (err || !data) throw error(404, 'Agendamento não encontrado');
	return data as AppointmentFull;
}

export async function createAppointment(
	supabase: SupabaseClient<Database>,
	appointment: AppointmentInsert,
	userPhone: string | null,
	userName: string,
	petName: string,
	serviceName: string
): Promise<Appointment> {
	const { data, error: err } = await supabase
		.from('appointments')
		.insert(appointment)
		.select()
		.single();

	if (err || !data) {
		log.error({ err, userId: appointment.user_id, serviceId: appointment.service_id }, 'Failed to create appointment');
		throw error(500, err?.message ?? 'Erro ao criar agendamento');
	}

	const created = data as Appointment;
	log.info(
		{ appointmentId: created.id, userId: appointment.user_id, serviceId: appointment.service_id, scheduledAt: appointment.scheduled_at },
		'Appointment created'
	);

	if (userPhone) {
		log.debug({ appointmentId: created.id, phone: userPhone }, 'Sending WhatsApp notification');
		const sid = await sendBookingConfirmation({
			toPhone: userPhone,
			userName,
			petName,
			serviceName,
			scheduledAt: appointment.scheduled_at
		});

		if (sid) {
			await supabase
				.from('appointments')
				.update({ whatsapp_notified: true, notification_sid: sid })
				.eq('id', created.id);
			log.info({ appointmentId: created.id, sid }, 'WhatsApp notification sent and recorded');
		} else {
			log.warn({ appointmentId: created.id }, 'WhatsApp notification failed or skipped');
		}
	}

	return created;
}

export async function cancelAppointment(
	supabase: SupabaseClient<Database>,
	appointmentId: string,
	userId: string,
	reason?: string
): Promise<void> {
	const { error: err } = await supabase
		.from('appointments')
		.update({
			status: 'cancelled' as const,
			cancelled_at: new Date().toISOString(),
			cancellation_reason: reason ?? null
		})
		.eq('id', appointmentId)
		.eq('user_id', userId)
		.in('status', ['pending', 'confirmed']);

	if (err) {
		log.error({ err, appointmentId, userId }, 'Failed to cancel appointment');
		throw error(500, err.message);
	}

	log.info({ appointmentId, userId, reason }, 'Appointment cancelled');
}
