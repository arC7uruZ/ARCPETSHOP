import { createServerSupabaseClient } from '$lib/supabase/server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerSupabaseClient(event.cookies);

	/**
	 * A utility to safely get the session without throwing on missing tokens.
	 * Uses getUser() for server-side validation (not just the cookie).
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) return { session: null, user: null };

		// Valida o JWT com os servidores do Supabase
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		// Se getUser() falhar (rede, token expirado aguardando refresh),
		// usa o user do payload do JWT em vez de deslogar o usuário.
		if (error) return { session, user: session.user };
		return { session, user };
	};

	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
