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
import logger from '$lib/server/logger';

const log = logger.child({ module: 'orders.server' });

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

	if (orderErr || !order) {
		log.error({ err: orderErr, userId: params.userId }, 'Failed to insert order');
		throw error(500, orderErr?.message ?? 'Erro ao criar pedido');
	}

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

	if (itemsErr) {
		log.error({ err: itemsErr, orderId: order.id }, 'Failed to insert order items');
		throw error(500, itemsErr.message);
	}

	log.debug({ orderId: order.id, itemCount: orderItems.length }, 'Order and items persisted');

	return order as unknown as Order;
}

export async function updateOrderMpOrder(
	supabase: SupabaseClient<Database>,
	orderId: string,
	mpOrderId: string,
	mpOrderStatus: string
): Promise<void> {
	const orderStatus: OrderStatus = mpOrderStatus === 'processed' ? 'paid' : 'pending_payment';

	const { error: err } = await supabase
		.from('orders')
		.update({
			mp_order_id: mpOrderId,
			mp_status: mpOrderStatus,
			status: orderStatus
		})
		.eq('id', orderId);

	if (err) {
		log.error({ err, orderId, mpOrderId }, 'Failed to update order with MP order id');
		throw error(500, err.message);
	}

	log.debug({ orderId, mpOrderId, mpOrderStatus, orderStatus }, 'Order updated with MP order id');
}

export async function updateOrderStatusByPaymentId(
	supabase: SupabaseClient<Database>,
	mpPaymentId: string,
	mpStatus: string
): Promise<void> {
	// Orders API uses 'processed'; classic Payments API uses 'approved'
	const orderStatus: OrderStatus = (mpStatus === 'approved' || mpStatus === 'processed') ? 'paid' : 'pending_payment';

	const { data: payment } = await supabase
		.from('payments')
		.select('order_id')
		.eq('mp_payment_id', mpPaymentId)
		.maybeSingle();

	if (!payment?.order_id) {
		log.warn({ mpPaymentId }, 'No order found for payment id, skipping status update');
		return;
	}

	const { error: err } = await supabase
		.from('orders')
		.update({ mp_status: mpStatus, status: orderStatus })
		.eq('id', payment.order_id);

	if (err) {
		log.error({ err, orderId: payment.order_id, mpPaymentId }, 'Failed to update order status');
	} else {
		log.info({ orderId: payment.order_id, mpPaymentId, mpStatus, orderStatus }, 'Order status updated via payment');
	}
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

	if (err) {
		log.error({ err, orderId: data.orderId, mpPaymentId: data.mpPaymentId }, 'Failed to store payment record');
		throw error(500, err.message);
	}

	log.debug(
		{ orderId: data.orderId, mpPaymentId: data.mpPaymentId, mpStatus: data.mpStatus },
		'Payment record stored'
	);
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
