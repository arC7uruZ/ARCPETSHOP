import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
	fetchCaretakers,
	updateCaretaker,
	searchUsersForCaretaker,
	promoteUserToCaretaker,
	demoteCaretaker
} from '$lib/server/caretakers.server';
import { fetchServices } from '$lib/server/services.server';

export const load: PageServerLoad = async ({ locals }) => {
	const [caretakers, services] = await Promise.all([
		fetchCaretakers(locals.supabase),
		fetchServices(locals.supabase)
	]);

	return { caretakers, services };
};

export const actions: Actions = {
	searchUsers: async ({ request, locals }) => {
		const formData = await request.formData();
		const query = String(formData.get('query') ?? '').trim();

		if (!query || query.length < 2) {
			return fail(400, { action: 'searchUsers', error: 'Digite ao menos 2 caracteres.' });
		}

		try {
			const results = await searchUsersForCaretaker(locals.supabase, query);
			return { action: 'searchUsers', results };
		} catch {
			return fail(500, { action: 'searchUsers', error: 'Erro ao buscar usuários.' });
		}
	},

	promote: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '').trim();
		const bio = String(formData.get('bio') ?? '').trim() || null;
		const specialties = formData.getAll('specialties').map(String);

		if (!userId) return fail(400, { action: 'promote', error: 'Usuário não selecionado.' });

		try {
			await promoteUserToCaretaker(locals.supabase, userId, { bio, specialties });
			return { success: true, action: 'promote' };
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : 'Erro ao promover usuário.';
			if (msg.includes('duplicate') || msg.includes('unique')) {
				return fail(409, { action: 'promote', error: 'Este usuário já é cuidador.' });
			}
			return fail(500, { action: 'promote', error: msg });
		}
	},

	toggleActive: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = String(formData.get('id') ?? '');
		const isActive = formData.get('isActive') === 'true';

		if (!id) return fail(400, { error: 'ID inválido.' });

		try {
			await updateCaretaker(locals.supabase, id, { is_active: isActive });
			return { success: true, action: 'toggle' };
		} catch {
			return fail(500, { error: 'Erro ao atualizar cuidador.' });
		}
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = String(formData.get('id') ?? '');

		if (!id) return fail(400, { error: 'ID inválido.' });

		try {
			await demoteCaretaker(locals.supabase, id);
			return { success: true, action: 'delete' };
		} catch {
			return fail(500, { error: 'Erro ao excluir cuidador.' });
		}
	}
};
