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

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { userRole } = await parent();

	// Apenas root_admin acessa o gerenciamento de roles
	if (userRole !== 'root_admin') redirect(303, '/admin');

	const [roles, allPermissions, users] = await Promise.all([
		fetchRolesWithPermissions(locals.supabase),
		fetchAllPermissions(locals.supabase),
		fetchAllUsers(locals.supabase)
	]);

	return { roles, allPermissions, users };
};

export const actions: Actions = {
	assignPermission: async ({ request, locals }) => {
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();
		if (!user) return fail(401, { error: 'Não autenticado.' });

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'root_admin') return fail(403, { error: 'Permissão negada.' });

		const formData = await request.formData();
		const roleId = String(formData.get('roleId') ?? '');
		const permissionId = String(formData.get('permissionId') ?? '');

		if (!roleId || !permissionId) return fail(400, { error: 'Dados inválidos.' });

		try {
			await assignPermissionToRole(locals.supabase, roleId, permissionId);
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao associar permissão.' });
		}
	},

	removePermission: async ({ request, locals }) => {
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();
		if (!user) return fail(401, { error: 'Não autenticado.' });

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'root_admin') return fail(403, { error: 'Permissão negada.' });

		const formData = await request.formData();
		const roleId = String(formData.get('roleId') ?? '');
		const permissionId = String(formData.get('permissionId') ?? '');

		if (!roleId || !permissionId) return fail(400, { error: 'Dados inválidos.' });

		try {
			await removePermissionFromRole(locals.supabase, roleId, permissionId);
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao remover permissão.' });
		}
	},

	assignUserRole: async ({ request, locals }) => {
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();
		if (!user) return fail(401, { error: 'Não autenticado.' });

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'root_admin') return fail(403, { error: 'Permissão negada.' });

		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '');
		const roleId = String(formData.get('roleId') ?? '');

		if (!userId || !roleId) return fail(400, { error: 'Dados inválidos.' });

		try {
			await assignRoleToUser(locals.supabase, userId, roleId, user.id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao associar role.' });
		}
	},

	removeUserRole: async ({ request, locals }) => {
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();
		if (!user) return fail(401, { error: 'Não autenticado.' });

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'root_admin') return fail(403, { error: 'Permissão negada.' });

		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '');
		const roleId = String(formData.get('roleId') ?? '');

		if (!userId || !roleId) return fail(400, { error: 'Dados inválidos.' });

		try {
			await removeRoleFromUser(locals.supabase, userId, roleId);
			return { success: true };
		} catch {
			return fail(500, { error: 'Erro ao remover role.' });
		}
	}
};
