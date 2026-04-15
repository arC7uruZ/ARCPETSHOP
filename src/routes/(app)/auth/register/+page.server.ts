import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { registerSchema } from '$lib/utils/validation.utils';
import { PUBLIC_SITE_URL } from '$env/static/public';

export const actions: Actions = {
	register: async ({ request, locals }) => {
		const formData = await request.formData();
		const data = {
			full_name: String(formData.get('full_name') ?? ''),
			email: String(formData.get('email') ?? ''),
			phone: String(formData.get('phone') ?? ''),
			password: String(formData.get('password') ?? ''),
			confirmPassword: String(formData.get('confirmPassword') ?? '')
		};

		const result = registerSchema.safeParse(data);
		if (!result.success) {
			const errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ''])
			);
			return fail(400, { errors });
		}

		const { error } = await locals.supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: {
				emailRedirectTo: `${PUBLIC_SITE_URL}/auth/callback`,
				data: {
					full_name: data.full_name,
					phone: data.phone || undefined
				}
			}
		});

		if (error) {
			return fail(400, {
				error: error.message.includes('already registered')
					? 'Este e-mail já está cadastrado. Tente fazer login.'
					: 'Erro ao criar conta. Tente novamente.'
			});
		}

		redirect(303, '/auth/register?success=1');
	}
};
