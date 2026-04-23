import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	fetchAllProducts,
	fetchActiveCategories,
	createProduct,
	updateProduct,
	toggleProductStatus,
	generateSlug
} from '$lib/server/products.server';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw redirect(303, '/login');

	const profile = await locals.supabase
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();

	if (!profile.data || !['admin', 'root_admin'].includes(profile.data.role)) {
		throw redirect(303, '/dashboard');
	}

	const [products, categories] = await Promise.all([
		fetchAllProducts(locals.supabase),
		fetchActiveCategories(locals.supabase)
	]);

	return { products, categories };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw redirect(303, '/login');

		const form = await request.formData();

		const price = parseFloat(form.get('price') as string);
		const originalPrice = form.get('original_price') ? parseFloat(form.get('original_price') as string) : null;
		const stock = parseInt(form.get('stock_quantity') as string) || 0;

		if (!form.get('name') || !form.get('brand') || !form.get('description') || isNaN(price)) {
			return fail(400, { error: 'Preencha todos os campos obrigatórios.' });
		}

		const name = form.get('name') as string;
		const slug = (form.get('slug') as string)?.trim() || generateSlug(name);

		await createProduct(locals.supabase, {
			category_id: (form.get('category_id') as string) || null,
			slug,
			name,
			brand: form.get('brand') as string,
			description: form.get('description') as string,
			short_description: (form.get('short_description') as string) || null,
			price,
			original_price: originalPrice,
			stock_quantity: stock,
			image_url: (form.get('image_url') as string) || null,
			tag: (form.get('tag') as string) || null,
			is_active: form.get('is_active') === 'true'
		});

		return { success: true };
	},

	update: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw redirect(303, '/login');

		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'ID inválido.' });

		const price = parseFloat(form.get('price') as string);
		const originalPrice = form.get('original_price') ? parseFloat(form.get('original_price') as string) : null;
		const stock = parseInt(form.get('stock_quantity') as string) || 0;

		const slugField = (form.get('slug') as string)?.trim();
		await updateProduct(locals.supabase, id, {
			category_id: (form.get('category_id') as string) || null,
			...(slugField ? { slug: slugField } : {}),
			name: form.get('name') as string,
			brand: form.get('brand') as string,
			description: form.get('description') as string,
			short_description: (form.get('short_description') as string) || null,
			price,
			original_price: originalPrice,
			stock_quantity: stock,
			image_url: (form.get('image_url') as string) || null,
			tag: (form.get('tag') as string) || null,
			is_active: form.get('is_active') === 'true'
		});

		return { success: true };
	},

	toggle: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw redirect(303, '/login');

		const form = await request.formData();
		const id = form.get('id') as string;
		const isActive = form.get('is_active') === 'true';

		if (!id) return fail(400, { error: 'ID inválido.' });

		await toggleProductStatus(locals.supabase, id, isActive);
		return { success: true };
	}
};
