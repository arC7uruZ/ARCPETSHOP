import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type {
	Order,
	OrderWithItems,
	OrderStatus,
	ValidatedCartItem,
	PaymentRecord
} from '$lib/types';
import { error } from '@sveltejs/kit';

interface CreateOrderParams {
	userId: string;
	items: ValidatedCartItem[];
	subtotal: number;
	shipping: number;
	total: number;
	shippingInfo: {
		name?: string;
		address?: string;
		city?: string;
		state?: string;
		zip?: string;
	};
}

export async function createOrder(
	supabase: SupabaseClient<Database>,
	params: CreateOrderParams
): Promise<Order> {
	const { data: order, error: orderErr } = await supabase
		.from('orders')
		.insert({
			user_id: params.userId,
			status: 'pending_payment',
			subtotal: params.subtotal,
			shipping: params.shipping,
			total: params.total,
			shipping_name: params.shippingInfo.name ?? null,
			shipping_address: params.shippingInfo.address ?? null,
			shipping_city: params.shippingInfo.city ?? null,
			shipping_state: params.shippingInfo.state ?? null,
			shipping_zip: params.shippingInfo.zip ?? null
		})
		.select()
		.single();

	if (orderErr || !order) throw error(500, orderErr?.message ?? 'Erro ao criar pedido');

	const orderItems = params.items.map((item) => ({
		order_id: order.id,
		product_id: item.productId,
		product_name: item.productName,
		product_brand: item.productBrand,
		unit_price: item.unitPrice,
		quantity: item.quantity,
		subtotal: item.subtotal
	}));

	const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);

	if (itemsErr) throw error(500, itemsErr.message);

	return order as unknown as Order;
}

export async function updateOrderPayment(
	supabase: SupabaseClient<Database>,
	orderId: string,
	mpPaymentId: string,
	mpStatus: string
): Promise<void> {
	const orderStatus: OrderStatus = mpStatus === 'approved' ? 'paid' : 'pending_payment';

	const { error: err } = await supabase
		.from('orders')
		.update({
			mp_payment_id: mpPaymentId,
			mp_status: mpStatus,
			status: orderStatus
		})
		.eq('id', orderId);

	if (err) throw error(500, err.message);
}

export async function updateOrderStatusByPaymentId(
	supabase: SupabaseClient<Database>,
	mpPaymentId: string,
	mpStatus: string
): Promise<void> {
	const orderStatus: OrderStatus = mpStatus === 'approved' ? 'paid' : 'pending_payment';

	await supabase
		.from('orders')
		.update({ mp_status: mpStatus, status: orderStatus })
		.eq('mp_payment_id', mpPaymentId);
}

export async function storePayment(
	supabase: SupabaseClient<Database>,
	data: {
		orderId: string;
		mpPaymentId: string;
		mpStatus: string;
		mpStatusDetail?: string;
		mpPaymentMethod?: string;
		mpPaymentType?: string;
		pixQrCode?: string;
		pixQrCodeBase64?: string;
		pixExpirationDate?: string;
		boletoUrl?: string;
		boletoBarcode?: string;
		rawResponse?: Record<string, unknown>;
	}
): Promise<void> {
	const { error: err } = await supabase.from('payments').insert({
		order_id: data.orderId,
		mp_payment_id: data.mpPaymentId,
		mp_status: data.mpStatus,
		mp_status_detail: data.mpStatusDetail ?? null,
		mp_payment_method: data.mpPaymentMethod ?? null,
		mp_payment_type: data.mpPaymentType ?? null,
		pix_qr_code: data.pixQrCode ?? null,
		pix_qr_code_base64: data.pixQrCodeBase64 ?? null,
		pix_expiration_date: data.pixExpirationDate ?? null,
		boleto_url: data.boletoUrl ?? null,
		boleto_barcode: data.boletoBarcode ?? null,
		raw_response: data.rawResponse ?? null
	});

	if (err) throw error(500, err.message);
}

export async function fetchUserOrders(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<Order[]> {
	const { data, error: err } = await supabase
		.from('orders')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (err) throw error(500, err.message);
	return (data ?? []) as unknown as Order[];
}

export async function fetchOrderWithItems(
	supabase: SupabaseClient<Database>,
	orderId: string,
	userId: string
): Promise<OrderWithItems> {
	const { data: order, error: orderErr } = await supabase
		.from('orders')
		.select('*')
		.eq('id', orderId)
		.eq('user_id', userId)
		.single();

	if (orderErr || !order) throw error(404, 'Pedido não encontrado');

	const { data: items, error: itemsErr } = await supabase
		.from('order_items')
		.select('*')
		.eq('order_id', orderId)
		.order('created_at', { ascending: true });

	if (itemsErr) throw error(500, itemsErr.message);

	const { data: payment } = await supabase
		.from('payments')
		.select('*')
		.eq('order_id', orderId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	return {
		...(order as unknown as Order),
		items: (items ?? []) as unknown as OrderWithItems['items'],
		payment: payment as PaymentRecord | null
	};
}

export async function fetchAllOrders(
	supabase: SupabaseClient<Database>
): Promise<(Order & { user_name: string })[]> {
	const { data, error: err } = await supabase
		.from('orders')
		.select('*, profile:profiles(full_name)')
		.order('created_at', { ascending: false });

	if (err) throw error(500, err.message);

	return (data ?? []).map((o: any) => ({
		...o,
		user_name: o.profile?.full_name ?? 'Desconhecido'
	}));
}
