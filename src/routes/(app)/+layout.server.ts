import type { LayoutServerLoad } from './$types';
import { fetchProfile } from '$lib/server/profiles.server';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) return { profile: null };
	const profile = await fetchProfile(locals.supabase, locals.user.id);
	return { profile };
};
