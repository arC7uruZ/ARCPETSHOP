import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Pet, PetInsert, PetUpdate } from '$lib/types';
import { error } from '@sveltejs/kit';

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

export async function createPet(supabase: SupabaseClient<Database>, pet: PetInsert): Promise<Pet> {
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

export async function deletePet(supabase: SupabaseClient<Database>, petId: string): Promise<void> {
	const { error: err } = await supabase.from('pets').update({ is_active: false }).eq('id', petId);

	if (err) throw error(500, err.message);
}

export async function uploadPetAvatar(
	supabase: SupabaseClient<Database>,
	petId: string,
	ownerId: string,
	file: File
): Promise<string> {
	const ext = file.name.split('.').pop() ?? 'jpg';
	const path = `${ownerId}/${petId}/${Date.now()}.${ext}`;
	const { error: uploadErr } = await supabase.storage.from('pet-avatars').upload(path, file, {
		upsert: true,
		contentType: file.type
	});
	if (uploadErr) throw error(500, uploadErr.message);

	const {
		data: { publicUrl }
	} = supabase.storage.from('pet-avatars').getPublicUrl(path);
	return publicUrl;
}
