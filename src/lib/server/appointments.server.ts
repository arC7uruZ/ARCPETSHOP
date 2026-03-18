import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Appointment, AppointmentFull, AppointmentInsert } from '$lib/types';
import { error } from '@sveltejs/kit';
import { sendBookingConfirmation } from './twilio.server';

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

	if (err || !data) throw error(500, err?.message ?? 'Erro ao criar agendamento');

	// Send WhatsApp notification if user has a phone and opted in
	if (userPhone) {
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
				.eq('id', data.id);
		}
	}

	return data;
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
			status: 'cancelled',
			cancelled_at: new Date().toISOString(),
			cancellation_reason: reason ?? null
		})
		.eq('id', appointmentId)
		.eq('user_id', userId)
		.in('status', ['pending', 'confirmed']);

	if (err) throw error(500, err.message);
}
