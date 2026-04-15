import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { fetchAllUsers, updateUserRole } from '$lib/server/admin.server';
import type { UserRole } from '$lib/types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const parentData = await parent();

	// Apenas root_admin pode acessar esta página
	if (parentData.userRole !== 'root_admin') {
		redirect(303, '/admin');
	}

	const users = await fetchAllUsers(locals.supabase);
	return { users };
};

export const actions: Actions = {
	updateRole: async ({ request, locals }) => {
		// Verificar que o usuário logado é root_admin
		const { data: { user } } = await locals.supabase.auth.getUser();
		if (!user) return fail(401, { error: 'Não autenticado.' });

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'root_admin') {
			return fail(403, { error: 'Permissão negada.' });
		}

		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '');
		const role = String(formData.get('role') ?? '') as UserRole;

		const validRoles: UserRole[] = ['customer', 'admin', 'root_admin'];
		if (!userId || !validRoles.includes(role)) {
			return fail(400, { error: 'Dados inválidos.' });
		}

		// Não permitir que o admin se rebaixe
		if (user.id === userId && role !== 'root_admin') {
			return fail(400, { error: 'Você não pode alterar sua própria role.' });
		}

		try {
			await updateUserRole(locals.supabase, userId, role);
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao atualizar permissão.' });
		}
	}
};
