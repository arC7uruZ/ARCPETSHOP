import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ data, parent }) => {
	const { session } = await parent();
	if (!session) {
		redirect(303, '/auth/login?redirectTo=/booking');
	}
	return data;
};
