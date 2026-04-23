import type { PageServerLoad } from './$types';
import { fetchActiveProducts, fetchActiveCategories } from '$lib/server/products.server';

export const load: PageServerLoad = async ({ locals }) => {
	const [products, categories] = await Promise.all([
		fetchActiveProducts(locals.supabase),
		fetchActiveCategories(locals.supabase)
	]);

	return { products, categories };
};
