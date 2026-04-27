import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Profile, ProfileUpdate } from '$lib/types';
import { error } from '@sveltejs/kit';
import logger from '$lib/server/logger';

const log = logger.child({ module: 'profiles.server' });

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('profiles')
        .upsert({ id: userId, ...updates } as any, { onConflict: 'id' })
        .select()
        .single();

    if (err || !data) {
        log.error({ err, userId }, 'Failed to update profile');
        throw error(500, err?.message ?? 'Erro ao atualizar perfil');
    }

    log.info({ userId }, 'Profile updated');
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

    if (uploadErr) {
        log.error({ err: uploadErr, userId }, 'Failed to upload avatar');
        throw error(500, uploadErr.message);
    }

    const {
        data: { publicUrl }
    } = supabase.storage.from('avatars').getPublicUrl(path);

    log.debug({ userId, path }, 'Avatar uploaded');
    return publicUrl;
}
