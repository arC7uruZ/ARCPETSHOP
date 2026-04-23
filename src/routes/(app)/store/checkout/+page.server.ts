import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchProfile } from '$lib/server/profiles.server';
import { PUBLIC_MERCADOPAGO_PUBLIC_KEY } from '$env/static/public';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw redirect(303, '/login?next=/store/checkout');

	const profile = await fetchProfile(locals.supabase, user.id);

	return {
		user,
		profile,
		mpPublicKey: PUBLIC_MERCADOPAGO_PUBLIC_KEY
	};
};
