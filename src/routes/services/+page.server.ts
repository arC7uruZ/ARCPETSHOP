import type { PageServerLoad } from './$types';
import { fetchServices } from '$lib/server/services.server';

export const load: PageServerLoad = async ({ locals }) => {
	const services = await fetchServices(locals.supabase);
	return { services };
};
