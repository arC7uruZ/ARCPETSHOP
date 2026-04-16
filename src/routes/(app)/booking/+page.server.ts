import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { fetchServiceById, fetchServices } from '$lib/server/services.server';
import { fetchPets } from '$lib/server/pets.server';
import { createAppointment } from '$lib/server/appointments.server';
import { fetchProfile } from '$lib/server/profiles.server';
import { fetchActiveCaretakers } from '$lib/server/caretakers.server';
import { bookingSchema } from '$lib/utils/validation.utils';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;
	if (!user) redirect(303, '/login?redirectTo=/booking');

	const [services, pets, caretakers] = await Promise.all([
		fetchServices(locals.supabase),
		fetchPets(locals.supabase, user.id),
		fetchActiveCaretakers(locals.supabase)
	]);

	return { services, pets, caretakers };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const { user } = locals;
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const scheduledAtRaw = String(formData.get('scheduledAt') ?? '');
		const serviceId = String(formData.get('serviceId') ?? '');
		const petId = String(formData.get('petId') ?? '');
		const caretakerId = String(formData.get('caretakerId') ?? '') || null;

		const dt = new Date(scheduledAtRaw);
		if (isNaN(dt.getTime())) {
			return fail(400, { error: 'Data/hora inválida.' });
		}

		const date = dt.toISOString().split('T')[0];
		const time = dt.toTimeString().slice(0, 5);

		const result = bookingSchema.safeParse({ serviceId, petId, date, time });
		if (!result.success) {
			const errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ''])
			);
			return fail(400, { errors, error: 'Por favor, corrija os campos inválidos.' });
		}

		const service = await fetchServiceById(locals.supabase, serviceId).catch(() => null);
		if (!service) return fail(400, { error: 'Serviço não encontrado.' });

		const profile = await fetchProfile(locals.supabase, user.id);

		const appointment = await createAppointment(
			locals.supabase,
			{
				user_id: user.id,
				pet_id: petId,
				service_id: service.id,
				caretaker_id: caretakerId,
				scheduled_at: scheduledAtRaw,
				duration_min: service.duration_min,
				notes: String(formData.get('notes') ?? '') || null
			},
			profile?.phone ?? null,
			profile?.full_name ?? 'Cliente',
			'',
			service.name
		);

		return { appointmentId: appointment.id };
	}
};
