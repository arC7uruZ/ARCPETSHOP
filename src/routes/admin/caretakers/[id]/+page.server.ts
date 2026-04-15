import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
	fetchCaretakerById,
	updateCaretaker,
	addCaretakerSchedule,
	removeCaretakerSchedule,
	toggleScheduleActive,
	blockCaretakerSlot,
	removeBlockedSlot
} from '$lib/server/caretakers.server';
import { fetchServices } from '$lib/server/services.server';

export const load: PageServerLoad = async ({ locals, params }) => {
	const [caretaker, services] = await Promise.all([
		fetchCaretakerById(locals.supabase, params.id),
		fetchServices(locals.supabase)
	]);

	return { caretaker, services };
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const bio = String(formData.get('bio') ?? '').trim() || null;
		const specialties = formData.getAll('specialties').map(String);

		if (!name) return fail(400, { error: 'Nome é obrigatório.' });

		try {
			await updateCaretaker(locals.supabase, params.id, { name, bio, specialties });
			return { success: true, action: 'update' };
		} catch {
			return fail(500, { error: 'Erro ao atualizar cuidador.' });
		}
	},

	addSchedule: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const dayOfWeek = parseInt(String(formData.get('dayOfWeek') ?? ''));
		const startTime = String(formData.get('startTime') ?? '');
		const endTime = String(formData.get('endTime') ?? '');

		if (isNaN(dayOfWeek) || !startTime || !endTime) {
			return fail(400, { error: 'Preencha todos os campos do horário.' });
		}
		if (startTime >= endTime) {
			return fail(400, { error: 'O horário de início deve ser anterior ao horário de término.' });
		}

		try {
			await addCaretakerSchedule(locals.supabase, {
				caretaker_id: params.id,
				day_of_week: dayOfWeek,
				start_time: startTime,
				end_time: endTime
			});
			return { success: true, action: 'addSchedule' };
		} catch {
			return fail(500, { error: 'Erro ao adicionar horário.' });
		}
	},

	removeSchedule: async ({ request, locals }) => {
		const formData = await request.formData();
		const scheduleId = String(formData.get('scheduleId') ?? '');

		if (!scheduleId) return fail(400, { error: 'ID inválido.' });

		try {
			await removeCaretakerSchedule(locals.supabase, scheduleId);
			return { success: true, action: 'removeSchedule' };
		} catch {
			return fail(500, { error: 'Erro ao remover horário.' });
		}
	},

	toggleSchedule: async ({ request, locals }) => {
		const formData = await request.formData();
		const scheduleId = String(formData.get('scheduleId') ?? '');
		const isActive = formData.get('isActive') === 'true';

		try {
			await toggleScheduleActive(locals.supabase, scheduleId, isActive);
			return { success: true, action: 'toggleSchedule' };
		} catch {
			return fail(500, { error: 'Erro ao atualizar horário.' });
		}
	},

	blockSlot: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const blockedDate = String(formData.get('blockedDate') ?? '');
		const startTime = String(formData.get('startTime') ?? '') || undefined;
		const endTime = String(formData.get('endTime') ?? '') || undefined;
		const reason = String(formData.get('reason') ?? '') || undefined;
		const fullDay = formData.get('fullDay') === 'on';

		if (!blockedDate) return fail(400, { error: 'Data é obrigatória.' });

		try {
			await blockCaretakerSlot(
				locals.supabase,
				params.id,
				blockedDate,
				fullDay ? undefined : startTime,
				fullDay ? undefined : endTime,
				reason
			);
			return { success: true, action: 'blockSlot' };
		} catch {
			return fail(500, { error: 'Erro ao bloquear horário.' });
		}
	},

	removeBlock: async ({ request, locals }) => {
		const formData = await request.formData();
		const blockId = String(formData.get('blockId') ?? '');

		try {
			await removeBlockedSlot(locals.supabase, blockId);
			return { success: true, action: 'removeBlock' };
		} catch {
			return fail(500, { error: 'Erro ao remover bloqueio.' });
		}
	}
};
