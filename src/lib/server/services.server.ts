import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Service } from '$lib/types';
import { error } from '@sveltejs/kit';

export async function fetchServices(supabase: SupabaseClient<Database>): Promise<Service[]> {
	const { data, error: err } = await supabase
		.from('services')
		.select('*')
		.eq('is_active', true)
		.order('display_order');

	if (err) throw error(500, err.message);
	return data ?? [];
}

export async function fetchServiceBySlug(
	supabase: SupabaseClient<Database>,
	slug: string
): Promise<Service> {
	const { data, error: err } = await supabase
		.from('services')
		.select('*')
		.eq('slug', slug)
		.eq('is_active', true)
		.single();

	if (err || !data) throw error(404, 'Serviço não encontrado');
	return data;
}
