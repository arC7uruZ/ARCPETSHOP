import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { fetchAllAppointments, updateAppointmentStatus } from '$lib/server/admin.server';
import { fetchCaretakers } from '$lib/server/caretakers.server';
import type { AppointmentStatus } from '$lib/types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const status = url.searchParams.get('status') as AppointmentStatus | null;
	const caretakerId = url.searchParams.get('caretaker') ?? undefined;
	const date = url.searchParams.get('date') ?? undefined;

	const [appointments, caretakers] = await Promise.all([
		fetchAllAppointments(locals.supabase, {
			status: status ?? undefined,
			caretakerId,
			date
		}),
		fetchCaretakers(locals.supabase)
	]);

	return { appointments, caretakers, filters: { status, caretakerId, date } };
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		const formData = await request.formData();
		const appointmentId = String(formData.get('appointmentId') ?? '');
		const status = String(formData.get('status') ?? '') as AppointmentStatus;
		const internalNotes = String(formData.get('internalNotes') ?? '') || undefined;

		const validStatuses: AppointmentStatus[] = [
			'pending',
			'confirmed',
			'in_progress',
			'completed',
			'cancelled',
			'no_show'
		];

		if (!appointmentId || !validStatuses.includes(status)) {
			return fail(400, { error: 'Dados inválidos.' });
		}

		try {
			await updateAppointmentStatus(locals.supabase, appointmentId, status, internalNotes);
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao atualizar agendamento.' });
		}
	}
};
