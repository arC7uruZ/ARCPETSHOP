import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import logger from '$lib/server/logger';

const log = logger.child({ module: 'auth.logout' });

export const POST: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	await locals.supabase.auth.signOut();
	log.info({ userId: user?.id }, 'User logged out');
	redirect(303, '/');
};
