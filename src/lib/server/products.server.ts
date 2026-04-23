import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Product, ProductCategory, ProductInsert, ProductUpdate } from '$lib/types';
import { error } from '@sveltejs/kit';

export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')  // remove acentos
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

export async function fetchActiveProducts(
	supabase: SupabaseClient<Database>
): Promise<Product[]> {
	const { data, error: err } = await supabase
		.from('products')
		.select('*, category:product_categories(*)')
		.eq('is_active', true)
		.order('display_order', { ascending: true });

	if (err) throw error(500, err.message);
	return (data ?? []) as unknown as Product[];
}

export async function fetchAllProducts(
	supabase: SupabaseClient<Database>
): Promise<Product[]> {
	const { data, error: err } = await supabase
		.from('products')
		.select('*, category:product_categories(*)')
		.order('display_order', { ascending: true });

	if (err) throw error(500, err.message);
	return (data ?? []) as unknown as Product[];
}

export async function fetchProductBySlug(
	supabase: SupabaseClient<Database>,
	slug: string
): Promise<Product> {
	const { data, error: err } = await supabase
		.from('products')
		.select('*, category:product_categories(*)')
		.eq('slug', slug)
		.eq('is_active', true)
		.single();

	if (err || !data) throw error(404, 'Produto não encontrado');
	return data as unknown as Product;
}

export async function fetchProductById(
	supabase: SupabaseClient<Database>,
	id: string
): Promise<Product> {
	const { data, error: err } = await supabase
		.from('products')
		.select('*, category:product_categories(*)')
		.eq('id', id)
		.single();

	if (err || !data) throw error(404, 'Produto não encontrado');
	return data as unknown as Product;
}

export async function fetchProductsByIds(
	supabase: SupabaseClient<Database>,
	ids: string[]
): Promise<Product[]> {
	if (ids.length === 0) return [];
	const { data, error: err } = await supabase
		.from('products')
		.select('*')
		.in('id', ids)
		.eq('is_active', true);

	if (err) throw error(500, err.message);
	return (data ?? []) as unknown as Product[];
}

export async function fetchActiveCategories(
	supabase: SupabaseClient<Database>
): Promise<ProductCategory[]> {
	const { data, error: err } = await supabase
		.from('product_categories')
		.select('*')
		.eq('is_active', true)
		.order('display_order', { ascending: true });

	if (err) throw error(500, err.message);
	return data ?? [];
}

export async function createProduct(
	supabase: SupabaseClient<Database>,
	product: ProductInsert
): Promise<Product> {
	const { data, error: err } = await supabase
		.from('products')
		.insert(product)
		.select()
		.single();

	if (err || !data) throw error(500, err?.message ?? 'Erro ao criar produto');
	return data as unknown as Product;
}

export async function updateProduct(
	supabase: SupabaseClient<Database>,
	id: string,
	updates: ProductUpdate
): Promise<Product> {
	const { data, error: err } = await supabase
		.from('products')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (err || !data) throw error(500, err?.message ?? 'Erro ao atualizar produto');
	return data as unknown as Product;
}

export async function toggleProductStatus(
	supabase: SupabaseClient<Database>,
	id: string,
	isActive: boolean
): Promise<void> {
	const { error: err } = await supabase
		.from('products')
		.update({ is_active: isActive })
		.eq('id', id);

	if (err) throw error(500, err.message);
}
