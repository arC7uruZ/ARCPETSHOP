import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Pet, PetInsert, PetUpdate } from '$lib/types';
import { error } from '@sveltejs/kit';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function fetchPets(
	supabase: SupabaseClient<Database>,
	ownerId: string
): Promise<Pet[]> {
	const { data, error: err } = await supabase
		.from('pets')
		.select('*')
		.eq('owner_id', ownerId)
		.eq('is_active', true)
		.order('name');

	if (err) throw error(500, err.message);
	return (data ?? []) as Pet[];
}

export async function createPet(
	supabase: SupabaseClient<Database>,
	pet: PetInsert
): Promise<Pet> {
    console.log("vai criar a porra do pet")
	const { data, error: err } = await supabase.from('pets').insert(pet).select().single();
	if (err || !data) {
        console.log(err?.message);
        throw error(500, err?.message ?? 'Erro ao criar pet');
    }
	return data as Pet;
}

export async function updatePet(
	supabase: SupabaseClient<Database>,
	petId: string,
	updates: PetUpdate
): Promise<Pet> {
	const { data, error: err } = await supabase
		.from('pets')
		.update(updates)
		.eq('id', petId)
		.select()
		.single();

	if (err || !data) throw error(500, err?.message ?? 'Erro ao atualizar pet');
	return data as Pet;
}

export async function deletePet(
	supabase: SupabaseClient<Database>,
	petId: string
): Promise<void> {
	const { error: err } = await supabase
		.from('pets')
		.update({ is_active: false })
		.eq('id', petId);

	if (err) throw error(500, err.message);
}

export async function uploadPetAvatar(
	petId: string,
	ownerId: string,
	file: File
): Promise<string> {
	const admin = createAdminClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
	const path = `${ownerId}/${petId}/${Date.now()}.${file.name.split('.').pop()}`;
	const { error: uploadErr } = await admin.storage.from('pet-avatars').upload(path, file, {
		upsert: true
	});
	if (uploadErr) throw error(500, uploadErr.message);

	const {
		data: { publicUrl }
	} = admin.storage.from('pet-avatars').getPublicUrl(path);
	return publicUrl;
}
