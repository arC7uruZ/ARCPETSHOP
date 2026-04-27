import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import {
	fetchRolesWithPermissions,
	fetchAllPermissions,
	assignPermissionToRole,
	removePermissionFromRole,
	assignRoleToUser,
	removeRoleFromUser
} from '$lib/server/permissions.server';
import { fetchAllUsers } from '$lib/server/admin.server';
import logger from '$lib/server/logger';

const log = logger.child({ module: 'admin.roles' });

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { userRole } = await parent();

	if (userRole !== 'root_admin') redirect(303, '/admin');

	const [roles, allPermissions, users] = await Promise.all([
		fetchRolesWithPermissions(locals.supabase),
		fetchAllPermissions(locals.supabase),
		fetchAllUsers(locals.supabase)
	]);

	return { roles, allPermissions, users };
};

async function requireRootAdmin(locals: App.Locals): Promise<string | null> {
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();
	if (!user) return null;

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();

	return profile?.role === 'root_admin' ? user.id : null;
}

export const actions: Actions = {
	assignPermission: async ({ request, locals }) => {
		const actorId = await requireRootAdmin(locals);
		if (!actorId) {
			log.warn('Unauthorized attempt to assign permission to role');
			return fail(403, { error: 'Permissão negada.' });
		}

		const formData = await request.formData();
		const roleId = String(formData.get('roleId') ?? '');
		const permissionId = String(formData.get('permissionId') ?? '');

		if (!roleId || !permissionId) return fail(400, { error: 'Dados inválidos.' });

		try {
			await assignPermissionToRole(locals.supabase, roleId, permissionId);
			log.info({ actorId, roleId, permissionId }, 'Permission assigned to role by root_admin');
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao associar permissão.' });
		}
	},

	removePermission: async ({ request, locals }) => {
		const actorId = await requireRootAdmin(locals);
		if (!actorId) {
			log.warn('Unauthorized attempt to remove permission from role');
			return fail(403, { error: 'Permissão negada.' });
		}

		const formData = await request.formData();
		const roleId = String(formData.get('roleId') ?? '');
		const permissionId = String(formData.get('permissionId') ?? '');

		if (!roleId || !permissionId) return fail(400, { error: 'Dados inválidos.' });

		try {
			await removePermissionFromRole(locals.supabase, roleId, permissionId);
			log.info({ actorId, roleId, permissionId }, 'Permission removed from role by root_admin');
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao remover permissão.' });
		}
	},

	assignUserRole: async ({ request, locals }) => {
		const actorId = await requireRootAdmin(locals);
		if (!actorId) {
			log.warn('Unauthorized attempt to assign role to user');
			return fail(403, { error: 'Permissão negada.' });
		}

		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '');
		const roleId = String(formData.get('roleId') ?? '');

		if (!userId || !roleId) return fail(400, { error: 'Dados inválidos.' });

		try {
			await assignRoleToUser(locals.supabase, userId, roleId, actorId);
			log.info({ actorId, userId, roleId }, 'Role assigned to user by root_admin');
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao associar role.' });
		}
	},

	removeUserRole: async ({ request, locals }) => {
		const actorId = await requireRootAdmin(locals);
		if (!actorId) {
			log.warn('Unauthorized attempt to remove role from user');
			return fail(403, { error: 'Permissão negada.' });
		}

		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '');
		const roleId = String(formData.get('roleId') ?? '');

		if (!userId || !roleId) return fail(400, { error: 'Dados inválidos.' });

		try {
			await removeRoleFromUser(locals.supabase, userId, roleId);
			log.info({ actorId, userId, roleId }, 'Role removed from user by root_admin');
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao remover role.' });
		}
	}
};
