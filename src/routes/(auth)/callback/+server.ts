import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import logger from '$lib/server/logger';

const log = logger.child({ module: 'auth.callback' });

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/profile';

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (error) {
			log.error({ err: error }, 'Failed to exchange auth code for session');
		} else {
			log.info({ next }, 'Auth code exchanged successfully');
		}
	} else {
		log.warn({ next }, 'Auth callback called without code parameter');
	}

	redirect(303, next);
};
