import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { loginSchema } from '$lib/utils/validation.utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { user } = locals;
	if (user) {
		const redirectTo = url.searchParams.get('redirectTo') ?? '/profile';
		redirect(303, redirectTo);
	}
	return {};
};

export const actions: Actions = {
	login: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '');
		const password = String(formData.get('password') ?? '');

		const result = loginSchema.safeParse({ email, password });
		if (!result.success) {
			return fail(400, { error: 'E-mail ou senha inválidos.' });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (error) {
			return fail(400, {
				error:
					error.message === 'Invalid login credentials'
						? 'E-mail ou senha incorretos.'
						: 'Erro ao fazer login. Tente novamente.'
			});
		}

		const redirectTo = url.searchParams.get('redirectTo') ?? '/profile';
		redirect(303, redirectTo);
	}
};
