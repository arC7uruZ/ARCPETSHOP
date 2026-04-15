import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { fetchCaretakers, createCaretaker, updateCaretaker, deleteCaretaker } from '$lib/server/caretakers.server';
import { fetchServices } from '$lib/server/services.server';

export const load: PageServerLoad = async ({ locals }) => {
	const [caretakers, services] = await Promise.all([
		fetchCaretakers(locals.supabase),
		fetchServices(locals.supabase)
	]);

	return { caretakers, services };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const bio = String(formData.get('bio') ?? '').trim() || null;
		const specialties = formData.getAll('specialties').map(String);

		if (!name) return fail(400, { error: 'Nome é obrigatório.' });

		try {
			await createCaretaker(locals.supabase, { name, bio, specialties });
			return { success: true, action: 'create' };
		} catch {
			return fail(500, { error: 'Erro ao criar cuidador.' });
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
			await deleteCaretaker(locals.supabase, id);
			return { success: true, action: 'delete' };
		} catch {
			return fail(500, { error: 'Erro ao excluir cuidador.' });
		}
	}
};
