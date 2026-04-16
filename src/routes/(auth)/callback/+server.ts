import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/dashboard';

	if (code) {
		await locals.supabase.auth.exchangeCodeForSession(code);
	}

	redirect(303, next);
};
