import type { PageServerLoad } from './$types';
import { fetchAdminStats, fetchRecentAppointments } from '$lib/server/admin.server';

export const load: PageServerLoad = async ({ locals }) => {
	const [stats, recentAppointments] = await Promise.all([
		fetchAdminStats(locals.supabase),
		fetchRecentAppointments(locals.supabase, 8)
	]);

	return { stats, recentAppointments };
};
