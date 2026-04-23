import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { CookieOptions } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

export const createServerSupabaseClient = (cookies: Cookies): SupabaseClient<Database> =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return cookies.getAll();
			},
			setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookies.set(name, value, { ...options, path: '/' })
					);
				} catch {
					// O Supabase pode tentar setar cookies após a response já ter sido enviada
					// (ex: refresh de token assíncrono). Pode ser ignorado com segurança —
					// o token atualizado será aplicado na próxima request.
				}
			}
		}
	}) as unknown as SupabaseClient<Database>;

// Admin client that bypasses RLS — only for server-side trusted operations (e.g. webhooks)
export const createSupabaseAdminClient = (): SupabaseClient<Database> =>
	createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { autoRefreshToken: false, persistSession: false }
	});
