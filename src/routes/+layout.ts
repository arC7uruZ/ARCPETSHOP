import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';
import type { Database } from '$lib/types/database.types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	depends('supabase:auth');

	// O cliente é criado aqui principalmente para expô-lo às páginas
	// e para o onAuthStateChange no +layout.svelte.
	// Em SSR, não chamamos getSession() neste cliente (sem setAll = sem refresh).
	// A sessão autoritativa já vem de +layout.server.ts via data.session.
	const supabase = isBrowser()
		? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: { fetch }
			})
		: createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: { fetch },
				cookies: {
					getAll: () => data.cookies
				}
			});

	return {
		session: data.session, // sessão já validada pelo hooks.server.ts
		supabase,
		user: data.user
	};
};
