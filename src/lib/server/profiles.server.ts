import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Profile, ProfileUpdate } from '$lib/types';
import { error } from '@sveltejs/kit';

export async function fetchProfile(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<Profile | null> {
	const { data, error: err } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single();

	if (err) return null;
	return data as Profile;
}

export async function updateProfile(
	supabase: SupabaseClient<Database>,
	userId: string,
	updates: ProfileUpdate
): Promise<Profile> {
	const { data, error: err } = await supabase
		.from('profiles')
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		.upsert({ id: userId, ...updates } as any, { onConflict: 'id' })
		.select()
		.single();

	if (err || !data) throw error(500, err?.message ?? 'Erro ao atualizar perfil');
	return data as Profile;
}

export async function uploadAvatar(
	supabase: SupabaseClient<Database>,
	userId: string,
	file: File
): Promise<string> {
	const ext = file.name.split('.').pop() ?? 'jpg';
	const path = `${userId}/${Date.now()}.${ext}`;
	const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, {
		upsert: true,
		contentType: file.type
	});
	if (uploadErr) throw error(500, uploadErr.message);

	const {
		data: { publicUrl }
	} = supabase.storage.from('avatars').getPublicUrl(path);
	return publicUrl;
}
