import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { fetchProfile, updateProfile, uploadAvatar } from '$lib/server/profiles.server';
import { fetchPets, createPet, updatePet, deletePet, uploadPetAvatar } from '$lib/server/pets.server';
import { profileSchema, petSchema } from '$lib/utils/validation.utils';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;
	if (!user) redirect(303, '/login');

	const [profile, pets] = await Promise.all([
		fetchProfile(locals.supabase, user.id),
		fetchPets(locals.supabase, user.id)
	]);

	return { profile, pets };
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const { user } = locals;
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const data = {
			full_name: String(formData.get('full_name') ?? ''),
			phone: String(formData.get('phone') ?? ''),
			address_street: String(formData.get('address_street') ?? ''),
			address_city: String(formData.get('address_city') ?? ''),
			address_state: String(formData.get('address_state') ?? ''),
			address_zip: String(formData.get('address_zip') ?? '')
		};

		const result = profileSchema.safeParse(data);
		if (!result.success) {
			const errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ''])
			);
			return fail(400, { errors, action: 'profile' });
		}

		try {
			await updateProfile(locals.supabase, user.id, data);
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : 'Erro ao salvar perfil';
			return fail(500, { error: msg, action: 'profile' });
		}
		return { success: true, action: 'profile' };
	},

	uploadAvatar: async ({ request, locals }) => {
		const { user } = locals;
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const file = formData.get('avatar') as File | null;

		if (!file || file.size === 0) return fail(400, { error: 'Nenhum arquivo selecionado.', action: 'avatar' });
		if (!file.type.startsWith('image/')) return fail(400, { error: 'Apenas imagens são permitidas.', action: 'avatar' });
		if (file.size > 5 * 1024 * 1024) return fail(400, { error: 'A imagem deve ter no máximo 5 MB.', action: 'avatar' });

		try {
			const avatarUrl = await uploadAvatar(locals.supabase, user.id, file);

			const { error: dbErr } = await locals.supabase
				.from('profiles')
				.update({ avatar_url: avatarUrl })
				.eq('id', user.id);

			if (dbErr) return fail(500, { error: dbErr.message, action: 'avatar' });
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : 'Erro ao enviar foto';
			return fail(500, { error: msg, action: 'avatar' });
		}
		return { success: true, action: 'avatar' };
	},

	createPet: async ({ request, locals }) => {
		const { user } = locals;
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const data = {
			name: String(formData.get('name') ?? ''),
			species: String(formData.get('species') ?? 'dog'),
			breed: String(formData.get('breed') ?? '') || null,
			size: String(formData.get('size') ?? '') || null,
			birth_date: String(formData.get('birth_date') ?? '') || null,
			weight_kg: formData.get('weight_kg') ? Number(formData.get('weight_kg')) : null,
			color: String(formData.get('color') ?? '') || null,
			notes: String(formData.get('notes') ?? '') || null
		};

		const result = petSchema.safeParse(data);
		if (!result.success) {
			const errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ''])
			);
			return fail(400, { errors, action: 'pet' });
		}

		try {
			const pet = await createPet(locals.supabase, { ...data, owner_id: user.id } as never);

			const avatarFile = formData.get('avatar') as File | null;
			if (avatarFile && avatarFile.size > 0 && avatarFile.type.startsWith('image/')) {
				const avatarUrl = await uploadPetAvatar(locals.supabase, pet.id, user.id, avatarFile);
				await locals.supabase.from('pets').update({ avatar_url: avatarUrl }).eq('id', pet.id);
			}
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : 'Erro ao criar pet';
			return fail(500, { error: msg, action: 'pet' });
		}
		return { success: true, action: 'createPet' };
	},

	updatePet: async ({ request, locals }) => {
		const { user } = locals;
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const petId = String(formData.get('petId') ?? '');
		if (!petId) return fail(400, { error: 'ID do pet inválido.' });

		const data = {
			name: String(formData.get('name') ?? ''),
			species: String(formData.get('species') ?? 'dog'),
			breed: String(formData.get('breed') ?? '') || null,
			size: String(formData.get('size') ?? '') || null,
			birth_date: String(formData.get('birth_date') ?? '') || null,
			weight_kg: formData.get('weight_kg') ? Number(formData.get('weight_kg')) : null,
			color: String(formData.get('color') ?? '') || null,
			notes: String(formData.get('notes') ?? '') || null
		};

		try {
			const avatarFile = formData.get('avatar') as File | null;
			let updates: typeof data & { avatar_url?: string } = data;

			if (avatarFile && avatarFile.size > 0 && avatarFile.type.startsWith('image/')) {
				const avatarUrl = await uploadPetAvatar(locals.supabase, petId, user.id, avatarFile);
				updates = { ...data, avatar_url: avatarUrl };
			}

			await updatePet(locals.supabase, petId, updates as never);
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : 'Erro ao atualizar pet';
			return fail(500, { error: msg, action: 'updatePet' });
		}
		return { success: true, action: 'updatePet' };
	},

	deletePet: async ({ request, locals }) => {
		const { user } = locals;
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const petId = String(formData.get('petId') ?? '');
		if (!petId) return fail(400, { error: 'ID do pet inválido.' });

		try {
			await deletePet(locals.supabase, petId);
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : 'Erro ao remover pet';
			return fail(500, { error: msg, action: 'deletePet' });
		}
		return { success: true, action: 'deletePet' };
	}
};
