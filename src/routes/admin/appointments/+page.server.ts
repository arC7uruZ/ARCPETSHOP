import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { fetchAllAppointments, updateAppointmentStatus } from '$lib/server/admin.server';
import { fetchCaretakers } from '$lib/server/caretakers.server';
import { hasPermission, getUserPermissions } from '$lib/server/permissions.server';
import type { AppointmentStatus, UserRole } from '$lib/types';

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	const { userRole, permissions } = await parent();
	const role = userRole as UserRole;

	if (!hasPermission(role, permissions, 'appointments:read')) {
		redirect(303, '/admin');
	}

	const status = url.searchParams.get('status') as AppointmentStatus | null;
	const caretakerId = url.searchParams.get('caretaker') ?? undefined;
	const date = url.searchParams.get('date') ?? undefined;

	// Caretakers só veem os próprios agendamentos
	let caretakerFilter = caretakerId;
	let isOwnOnly = false;

	if (!hasPermission(role, permissions, 'appointments:read:all')) {
		const { data: caretaker } = await locals.supabase
			.from('caretakers')
			.select('id')
			.eq('user_id', locals.user!.id)
			.single();

		if (!caretaker) redirect(303, '/admin');
		caretakerFilter = caretaker.id;
		isOwnOnly = true;
	}

	const [appointments, caretakers] = await Promise.all([
		fetchAllAppointments(locals.supabase, {
			status: status ?? undefined,
			caretakerId: caretakerFilter,
			date
		}),
		// Caretakers não precisam ver o filtro de seleção de cuidador
		isOwnOnly ? Promise.resolve([]) : fetchCaretakers(locals.supabase)
	]);

	const canWrite = hasPermission(role, permissions, 'appointments:write');

	return {
		appointments,
		caretakers,
		filters: { status, caretakerId, date },
		isOwnOnly,
		canWrite
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();
		if (!user) return fail(401, { error: 'Não autenticado.' });

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		const role = (profile?.role ?? 'customer') as UserRole;
		const permissions = await getUserPermissions(locals.supabase, user.id);

		if (!hasPermission(role, permissions, 'appointments:write')) {
			return fail(403, { error: 'Sem permissão para alterar agendamentos.' });
		}

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
