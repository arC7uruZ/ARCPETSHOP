import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { fetchAllUsers, updateUserRole } from '$lib/server/admin.server';
import { canManageUser } from '$lib/utils/permissions';
import logger from '$lib/server/logger';
import type { UserRole } from '$lib/types';

const log = logger.child({ module: 'admin.users' });

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { userRole } = await parent();

	if (userRole !== 'admin' && userRole !== 'root_admin') {
		redirect(303, '/admin');
	}

	const users = await fetchAllUsers(locals.supabase);
	return { users };
};

export const actions: Actions = {
	updateRole: async ({ request, locals }) => {
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();
		if (!user) return fail(401, { error: 'Não autenticado.' });

		const { data: actorProfile } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		const actorRole = (actorProfile?.role ?? 'customer') as UserRole;
		if (actorRole !== 'admin' && actorRole !== 'root_admin') {
			log.warn({ actorId: user.id, actorRole }, 'Unauthorized attempt to update user role');
			return fail(403, { error: 'Permissão negada.' });
		}

		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '');
		const newRole = String(formData.get('role') ?? '') as UserRole;

		const validRoles: UserRole[] = ['customer', 'caretaker', 'admin', 'root_admin'];
		if (!userId || !validRoles.includes(newRole)) {
			return fail(400, { error: 'Dados inválidos.' });
		}

		if (user.id === userId && newRole !== actorRole) {
			log.warn({ actorId: user.id }, 'User attempted to change their own role');
			return fail(400, { error: 'Você não pode alterar sua própria role.' });
		}

		const { data: targetProfile } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', userId)
			.single();

		const targetRole = (targetProfile?.role ?? 'customer') as UserRole;

		if (!canManageUser(actorRole, targetRole) || !canManageUser(actorRole, newRole)) {
			log.warn({ actorId: user.id, actorRole, targetId: userId, targetRole, newRole }, 'Insufficient permissions to manage user role');
			return fail(403, { error: 'Sem permissão para gerenciar administradores.' });
		}

		try {
			await updateUserRole(locals.supabase, userId, newRole);
			log.info({ actorId: user.id, targetId: userId, fromRole: targetRole, toRole: newRole }, 'User role updated by admin');
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao atualizar role.' });
		}
	}
};
