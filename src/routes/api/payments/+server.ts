import { json } from '@sveltejs/kit';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import {
	MERCADOPAGO_ACCESS_TOKEN,
	MERCADOPAGO_IDEMPOTENCY_KEY_PREFIX
} from '$env/static/private';
import { PUBLIC_SITE_URL } from '$env/static/public';
import { fetchProductsByIds } from '$lib/server/products.server';
import { createOrder, updateOrderPayment, storePayment } from '$lib/server/orders.server';
import type { RequestHandler } from './$types';
import type { CartItem } from '$lib/types';

interface PaymentBody {
	formData: Record<string, unknown>;
	cartItems: CartItem[];
	shippingInfo: {
		name?: string;
		address?: string;
		city?: string;
		state?: string;
		zip?: string;
	};
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) return json({ error: 'Não autenticado' }, { status: 401 });

	let body: PaymentBody;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Requisição inválida' }, { status: 400 });
	}

	const { formData, cartItems, shippingInfo } = body;

	if (!cartItems?.length) {
		return json({ error: 'Carrinho vazio' }, { status: 400 });
	}

	// Validate cart against DB prices (never trust client prices)
	const productIds = cartItems.map((i) => i.productId);
	const products = await fetchProductsByIds(locals.supabase, productIds);

	if (products.length !== productIds.length) {
		return json({ error: 'Um ou mais produtos não estão disponíveis' }, { status: 422 });
	}

	let subtotal = 0;
	const validatedItems = cartItems.map((cartItem) => {
		const product = products.find((p) => p.id === cartItem.productId);
		if (!product) throw new Error(`Produto não encontrado: ${cartItem.productId}`);
		const itemSubtotal = product.price * cartItem.quantity;
		subtotal += itemSubtotal;
		return {
			productId: product.id,
			productName: product.name,
			productBrand: product.brand,
			unitPrice: product.price,
			quantity: cartItem.quantity,
			subtotal: itemSubtotal
		};
	});

	const shippingCost = subtotal >= 150 ? 0 : 15;
	const total = subtotal + shippingCost;

	// Create order in DB
	const order = await createOrder(locals.supabase, {
		userId: user.id,
		items: validatedItems,
		subtotal,
		shipping: shippingCost,
		total,
		shippingInfo
	});

	// Create MP payment
	const client = new MercadoPagoConfig({
		accessToken: MERCADOPAGO_ACCESS_TOKEN,
		options: { timeout: 10000 }
	});
	const paymentClient = new Payment(client);

	let mpPayment;
	try {
		mpPayment = await paymentClient.create({
			body: {
				...(formData as Parameters<typeof paymentClient.create>[0]['body']),
				transaction_amount: total,
				description: `ArcPetShop - Pedido ${order.id.slice(0, 8).toUpperCase()}`,
				external_reference: order.id,
				notification_url: `${PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
				payer: {
					email: user.email ?? '',
					...((formData as { payer?: Record<string, unknown> }).payer ?? {})
				}
			},
			requestOptions: {
				idempotencyKey: `${MERCADOPAGO_IDEMPOTENCY_KEY_PREFIX ?? 'arc'}-${order.id}`
			}
		});
	} catch (mpErr) {
		console.error('MP Payment error:', mpErr);
		return json(
			{ error: 'Erro ao processar pagamento com Mercado Pago', orderId: order.id },
			{ status: 502 }
		);
	}

	// Store payment record
	const pixData = (
		mpPayment as unknown as {
			point_of_interaction?: {
				transaction_data?: {
					qr_code?: string;
					qr_code_base64?: string;
					ticket_url?: string;
				};
			};
		}
	).point_of_interaction?.transaction_data;

	const boletoData = (
		mpPayment as unknown as {
			transaction_details?: { external_resource_url?: string; barcode_content?: string };
		}
	).transaction_details;

	await storePayment(locals.supabase, {
		orderId: order.id,
		mpPaymentId: String(mpPayment.id),
		mpStatus: mpPayment.status ?? 'unknown',
		mpStatusDetail: mpPayment.status_detail ?? undefined,
		mpPaymentMethod: (mpPayment as unknown as { payment_method_id?: string }).payment_method_id,
		mpPaymentType: (mpPayment as unknown as { payment_type_id?: string }).payment_type_id,
		pixQrCode: pixData?.qr_code,
		pixQrCodeBase64: pixData?.qr_code_base64,
		pixExpirationDate: pixData?.ticket_url,
		boletoUrl: boletoData?.external_resource_url,
		boletoBarcode: boletoData?.barcode_content,
		rawResponse: mpPayment as unknown as Record<string, unknown>
	});

	// Update order with payment info
	await updateOrderPayment(locals.supabase, order.id, String(mpPayment.id), mpPayment.status ?? '');

	return json({
		orderId: order.id,
		paymentId: mpPayment.id,
		status: mpPayment.status,
		statusDetail: mpPayment.status_detail
	});
};
