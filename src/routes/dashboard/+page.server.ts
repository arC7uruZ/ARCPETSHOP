import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { fetchUserAppointments, cancelAppointment } from '$lib/server/appointments.server';
import { fetchProfile } from '$lib/server/profiles.server';
import { fetchPets } from '$lib/server/pets.server';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;
	if (!user) redirect(303, '/auth/login');

	const [appointments, profile, pets] = await Promise.all([
		fetchUserAppointments(locals.supabase, user.id),
		fetchProfile(locals.supabase, user.id),
		fetchPets(locals.supabase, user.id)
	]);

	return { appointments, profile, pets };
};

export const actions: Actions = {
	cancelAppointment: async ({ request, locals }) => {
		const { user } = locals;
		if (!user) redirect(303, '/auth/login');

		const formData = await request.formData();
		const appointmentId = String(formData.get('appointmentId') ?? '');
		const reason = String(formData.get('reason') ?? '');

        // console.log(`apointmentid: ${appointmentId}`)
        // console.log(`userid: ${user.id}`)

		if (!appointmentId) return fail(400, { error: 'ID do agendamento inválido.' });

        try {
		    await cancelAppointment(locals.supabase, appointmentId, user.id, reason);
        } catch {
            return fail(500, { error: 'Não foi possível cancelar o agendamento.'});
        }
		return { success: true };
	}
};
