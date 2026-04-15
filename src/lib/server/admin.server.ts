import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { AdminStats, AppointmentFull, AppointmentStatus, Profile, UserRole } from '$lib/types';
import { error } from '@sveltejs/kit';

export async function fetchAdminStats(
	supabase: SupabaseClient<Database>
): Promise<AdminStats> {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const [todayResult, pendingResult, confirmedResult, usersResult, caretakersResult] =
		await Promise.all([
			supabase
				.from('appointments')
				.select('id', { count: 'exact', head: true })
				.gte('scheduled_at', today.toISOString())
				.lt('scheduled_at', tomorrow.toISOString())
				.not('status', 'in', '("cancelled","no_show")'),
			supabase
				.from('appointments')
				.select('id', { count: 'exact', head: true })
				.eq('status', 'pending'),
			supabase
				.from('appointments')
				.select('id', { count: 'exact', head: true })
				.eq('status', 'confirmed'),
			supabase
				.from('profiles')
				.select('id', { count: 'exact', head: true })
				.eq('role', 'customer'),
			supabase
				.from('caretakers')
				.select('id', { count: 'exact', head: true })
				.eq('is_active', true)
		]);

	return {
		totalAppointmentsToday: todayResult.count ?? 0,
		pendingAppointments: pendingResult.count ?? 0,
		confirmedAppointments: confirmedResult.count ?? 0,
		totalUsers: usersResult.count ?? 0,
		activeCaretakers: caretakersResult.count ?? 0
	};
}

export async function fetchAllAppointments(
	supabase: SupabaseClient<Database>,
	filters?: {
		status?: AppointmentStatus;
		caretakerId?: string;
		date?: string;
		search?: string;
	}
): Promise<AppointmentFull[]> {
	let query = supabase
		.from('appointments_full')
		.select('*')
		.order('scheduled_at', { ascending: false });

	if (filters?.status) {
		query = query.eq('status', filters.status);
	}
	if (filters?.caretakerId) {
		query = query.eq('caretaker_id', filters.caretakerId);
	}
	if (filters?.date) {
		const start = new Date(filters.date);
		start.setHours(0, 0, 0, 0);
		const end = new Date(filters.date);
		end.setHours(23, 59, 59, 999);
		query = query.gte('scheduled_at', start.toISOString()).lte('scheduled_at', end.toISOString());
	}

	const { data, error: err } = await query;
	if (err) throw error(500, err.message);
	return (data ?? []) as AppointmentFull[];
}

export async function fetchRecentAppointments(
	supabase: SupabaseClient<Database>,
	limit = 10
): Promise<AppointmentFull[]> {
	const { data, error: err } = await supabase
		.from('appointments_full')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(limit);

	if (err) throw error(500, err.message);
	return (data ?? []) as AppointmentFull[];
}

export async function updateAppointmentStatus(
	supabase: SupabaseClient<Database>,
	appointmentId: string,
	status: AppointmentStatus,
	internalNotes?: string
): Promise<void> {
	const updateData: Record<string, unknown> = { status };
	if (status === 'cancelled') {
		updateData.cancelled_at = new Date().toISOString();
	}
	if (internalNotes !== undefined) {
		updateData.internal_notes = internalNotes;
	}

	const { error: err } = await supabase
		.from('appointments')
		.update(updateData)
		.eq('id', appointmentId);

	if (err) throw error(500, err.message);
}

export async function fetchAllUsers(
	supabase: SupabaseClient<Database>
): Promise<Profile[]> {
	const { data, error: err } = await supabase
		.from('profiles')
		.select('*')
		.order('created_at', { ascending: false });

	if (err) throw error(500, err.message);
	return (data ?? []) as Profile[];
}

export async function updateUserRole(
	supabase: SupabaseClient<Database>,
	userId: string,
	role: UserRole
): Promise<void> {
	const { error: err } = await supabase
		.from('profiles')
		.update({ role })
		.eq('id', userId);

	if (err) throw error(500, err.message);
}
