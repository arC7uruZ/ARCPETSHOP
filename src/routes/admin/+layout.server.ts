import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserPermissions } from '$lib/server/permissions.server';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = locals;
	if (!user) redirect(303, '/login?redirectTo=/admin');

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('role, full_name')
		.eq('id', user.id)
		.single();

	const role = profile?.role ?? 'customer';

	// admins e caretakers têm acesso; customers não
	const allowedRoles = ['admin', 'root_admin', 'caretaker'];
	if (!allowedRoles.includes(role)) {
		redirect(303, '/profile');
	}

	// Caretakers e roles não-admin precisam de permissões explícitas
	// Admins e root_admin têm bypass no hasPermission — carregamos mesmo assim
	// para exibir na UI de gerenciamento de roles
	const permissions = await getUserPermissions(locals.supabase, user.id);

	return {
		userRole: role as 'admin' | 'root_admin' | 'caretaker',
		adminName: profile?.full_name ?? '',
		permissions
	};
};
