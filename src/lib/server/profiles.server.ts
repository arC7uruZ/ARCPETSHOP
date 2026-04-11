import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Profile, ProfileUpdate } from '$lib/types';
import { error } from '@sveltejs/kit';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

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
	userId: string,
	file: File
): Promise<string> {
	const admin = createAdminClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
	const path = `${userId}/${Date.now()}.${file.name.split('.').pop()}`;
	const { error: uploadErr } = await admin.storage.from('avatars').upload(path, file, {
		upsert: true
	});
	if (uploadErr) throw error(500, uploadErr.message);

	const {
		data: { publicUrl }
	} = admin.storage.from('avatars').getPublicUrl(path);
	return publicUrl;
}
