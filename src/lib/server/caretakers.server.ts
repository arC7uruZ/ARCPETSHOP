import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type {
	Caretaker,
	CaretakerInsert,
	CaretakerUpdate,
	CaretakerSchedule,
	CaretakerScheduleInsert,
	CaretakerBlockedSlot,
	CaretakerWithSchedules
} from '$lib/types';
import { error } from '@sveltejs/kit';

export async function fetchCaretakers(
	supabase: SupabaseClient<Database>
): Promise<Caretaker[]> {
	const { data, error: err } = await supabase
		.from('caretakers')
		.select('*')
		.order('name');

	if (err) throw error(500, err.message);
	return (data ?? []) as Caretaker[];
}

export async function fetchActiveCaretakers(
	supabase: SupabaseClient<Database>
): Promise<Caretaker[]> {
	const { data, error: err } = await supabase
		.from('caretakers')
		.select('*')
		.eq('is_active', true)
		.order('name');

	if (err) throw error(500, err.message);
	return (data ?? []) as Caretaker[];
}

export async function fetchCaretakersByService(
	supabase: SupabaseClient<Database>,
	serviceId: string
): Promise<Caretaker[]> {
	const { data, error: err } = await supabase
		.from('caretakers')
		.select('*')
		.eq('is_active', true)
		.contains('specialties', [serviceId])
		.order('name');

	if (err) throw error(500, err.message);
	return (data ?? []) as Caretaker[];
}

export async function fetchCaretakerById(
	supabase: SupabaseClient<Database>,
	id: string
): Promise<CaretakerWithSchedules> {
	const [caretakerResult, schedulesResult, blockedResult] = await Promise.all([
		supabase.from('caretakers').select('*').eq('id', id).single(),
		supabase
			.from('caretaker_schedules')
			.select('*')
			.eq('caretaker_id', id)
			.order('day_of_week')
			.order('start_time'),
		supabase
			.from('caretaker_blocked_slots')
			.select('*')
			.eq('caretaker_id', id)
			.gte('blocked_date', new Date().toISOString().split('T')[0])
			.order('blocked_date')
	]);

	if (caretakerResult.error || !caretakerResult.data) {
		throw error(404, 'Cuidador não encontrado');
	}

	return {
		...(caretakerResult.data as Caretaker),
		schedules: (schedulesResult.data ?? []) as CaretakerSchedule[],
		blocked_slots: (blockedResult.data ?? []) as CaretakerBlockedSlot[]
	};
}

export async function createCaretaker(
	supabase: SupabaseClient<Database>,
	data: CaretakerInsert
): Promise<Caretaker> {
	const { data: created, error: err } = await supabase
		.from('caretakers')
		.insert(data)
		.select()
		.single();

	if (err || !created) throw error(500, err?.message ?? 'Erro ao criar cuidador');
	return created as Caretaker;
}

export async function updateCaretaker(
	supabase: SupabaseClient<Database>,
	id: string,
	data: CaretakerUpdate
): Promise<void> {
	const { error: err } = await supabase
		.from('caretakers')
		.update(data)
		.eq('id', id);

	if (err) throw error(500, err.message);
}

export async function deleteCaretaker(
	supabase: SupabaseClient<Database>,
	id: string
): Promise<void> {
	const { error: err } = await supabase.from('caretakers').delete().eq('id', id);
	if (err) throw error(500, err.message);
}

export async function addCaretakerSchedule(
	supabase: SupabaseClient<Database>,
	schedule: CaretakerScheduleInsert
): Promise<CaretakerSchedule> {
	const { data, error: err } = await supabase
		.from('caretaker_schedules')
		.insert(schedule)
		.select()
		.single();

	if (err || !data) throw error(500, err?.message ?? 'Erro ao adicionar horário');
	return data as CaretakerSchedule;
}

export async function removeCaretakerSchedule(
	supabase: SupabaseClient<Database>,
	scheduleId: string
): Promise<void> {
	const { error: err } = await supabase
		.from('caretaker_schedules')
		.delete()
		.eq('id', scheduleId);

	if (err) throw error(500, err.message);
}

export async function toggleScheduleActive(
	supabase: SupabaseClient<Database>,
	scheduleId: string,
	isActive: boolean
): Promise<void> {
	const { error: err } = await supabase
		.from('caretaker_schedules')
		.update({ is_active: isActive })
		.eq('id', scheduleId);

	if (err) throw error(500, err.message);
}

export async function blockCaretakerSlot(
	supabase: SupabaseClient<Database>,
	caretakerId: string,
	blockedDate: string,
	startTime?: string,
	endTime?: string,
	reason?: string
): Promise<CaretakerBlockedSlot> {
	const { data, error: err } = await supabase
		.from('caretaker_blocked_slots')
		.insert({
			caretaker_id: caretakerId,
			blocked_date: blockedDate,
			start_time: startTime ?? null,
			end_time: endTime ?? null,
			reason: reason ?? null
		})
		.select()
		.single();

	if (err || !data) throw error(500, err?.message ?? 'Erro ao bloquear horário');
	return data as CaretakerBlockedSlot;
}

export async function removeBlockedSlot(
	supabase: SupabaseClient<Database>,
	blockId: string
): Promise<void> {
	const { error: err } = await supabase
		.from('caretaker_blocked_slots')
		.delete()
		.eq('id', blockId);

	if (err) throw error(500, err.message);
}

// ── Disponibilidade ────────────────────────────────────────────────────────

/**
 * Retorna os slots de tempo disponíveis para um cuidador em uma data específica.
 * Considera a agenda semanal, bloqueios manuais e agendamentos já criados.
 */
export async function getCaretakerAvailability(
	supabase: SupabaseClient<Database>,
	caretakerId: string,
	date: string, // YYYY-MM-DD
	durationMin: number
): Promise<string[]> {
	const dateObj = new Date(`${date}T00:00:00`);
	const dayOfWeek = dateObj.getDay(); // 0=Domingo, 6=Sábado

	const [schedulesResult, blockedResult, appointmentsResult] = await Promise.all([
		supabase
			.from('caretaker_schedules')
			.select('*')
			.eq('caretaker_id', caretakerId)
			.eq('day_of_week', dayOfWeek)
			.eq('is_active', true),
		supabase
			.from('caretaker_blocked_slots')
			.select('*')
			.eq('caretaker_id', caretakerId)
			.eq('blocked_date', date),
		supabase
			.from('appointments')
			.select('scheduled_at, duration_min')
			.eq('caretaker_id', caretakerId)
			.gte('scheduled_at', `${date}T00:00:00`)
			.lt('scheduled_at', `${date}T23:59:59`)
			.not('status', 'in', '("cancelled","no_show")')
	]);

	const schedules = (schedulesResult.data ?? []) as CaretakerSchedule[];
	const blocked = (blockedResult.data ?? []) as CaretakerBlockedSlot[];
	const appointments = appointmentsResult.data ?? [];

	if (schedules.length === 0) return [];

	// Verificar se o dia inteiro está bloqueado
	const fullDayBlock = blocked.find((b) => !b.start_time && !b.end_time);
	if (fullDayBlock) return [];

	const availableSlots: string[] = [];

	for (const schedule of schedules) {
		const startMinutes = timeToMinutes(schedule.start_time);
		const endMinutes = timeToMinutes(schedule.end_time);

		for (let m = startMinutes; m + durationMin <= endMinutes; m += 30) {
			const slotEnd = m + durationMin;
			const slotStr = minutesToTime(m);

			// Verificar bloqueios parciais
			const isBlocked = blocked.some((b) => {
				if (!b.start_time || !b.end_time) return false;
				const bStart = timeToMinutes(b.start_time);
				const bEnd = timeToMinutes(b.end_time);
				return m < bEnd && slotEnd > bStart;
			});
			if (isBlocked) continue;

			// Verificar agendamentos existentes
			const isBooked = appointments.some((appt) => {
				const apptDate = new Date(appt.scheduled_at as string);
				const apptStart = apptDate.getHours() * 60 + apptDate.getMinutes();
				const apptEnd = apptStart + ((appt.duration_min as number) ?? 30);
				return m < apptEnd && slotEnd > apptStart;
			});
			if (isBooked) continue;

			availableSlots.push(slotStr);
		}
	}

	return availableSlots;
}

function timeToMinutes(time: string): number {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
}

function minutesToTime(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const DAY_NAMES = [
	'Domingo',
	'Segunda-feira',
	'Terça-feira',
	'Quarta-feira',
	'Quinta-feira',
	'Sexta-feira',
	'Sábado'
];
