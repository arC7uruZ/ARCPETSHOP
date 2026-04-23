import type { PageServerLoad } from './$types';
import { fetchProductBySlug, fetchActiveProducts } from '$lib/server/products.server';

export const load: PageServerLoad = async ({ locals, params }) => {
	const product = await fetchProductBySlug(locals.supabase, params.slug);

	// Produtos relacionados da mesma categoria (excluindo o atual)
	const allProducts = await fetchActiveProducts(locals.supabase);
	const related = allProducts
		.filter((p) => p.category_id === product.category_id && p.id !== product.id)
		.slice(0, 4);

	return { product, related };
};
