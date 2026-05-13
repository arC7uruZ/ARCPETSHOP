import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserPermissions } from '$lib/server/permissions.server';
import logger from '$lib/server/logger';
import { fetchProfile } from '$lib/server';

const log = logger.child({ module: 'admin.layout' });

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = locals;
	if (!user) redirect(303, '/login?redirectTo=/admin');

    const profile = await fetchProfile(locals.supabase, user.id);

	const role = profile?.role ?? 'customer';

	const allowedRoles = ['admin', 'root_admin', 'caretaker'];
	if (!allowedRoles.includes(role)) {
		log.warn({ userId: user.id, role }, 'Unauthorized admin access attempt');
		redirect(303, '/profile');
	}

	const permissions = await getUserPermissions(locals.supabase, user.id);

	log.debug({ userId: user.id, role, permissionCount: permissions.length }, 'Admin layout loaded');

	return {
		userRole: role as 'admin' | 'root_admin' | 'caretaker',
		adminName: profile?.full_name ?? '',
		permissions
	};
};
