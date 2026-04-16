import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = locals;
	if (!user) redirect(303, '/login?redirectTo=/admin');

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('role, full_name')
		.eq('id', user.id)
		.single();

	const role = profile?.role ?? 'customer';

	if (role !== 'admin' && role !== 'root_admin') {
		redirect(303, '/dashboard');
	}

	return {
		userRole: role as 'admin' | 'root_admin',
		adminName: profile?.full_name ?? ''
	};
};
