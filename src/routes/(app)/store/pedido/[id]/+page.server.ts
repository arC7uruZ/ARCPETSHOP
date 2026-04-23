import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchOrderWithItems } from '$lib/server/orders.server';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw redirect(303, '/login');

	const order = await fetchOrderWithItems(locals.supabase, params.id, user.id);

	return { order };
};
