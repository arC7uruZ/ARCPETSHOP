import { json } from '@sveltejs/kit';
import { MercadoPagoConfig, Payment, Order as MpOrder } from 'mercadopago';
import { MERCADOPAGO_ACCESS_TOKEN } from '$env/static/private';
import { updateOrderStatusByPaymentId } from '$lib/server/orders.server';
import logger from '$lib/server/logger';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase/server';

const log = logger.child({ module: 'webhook.mercadopago' });

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		log.warn('Received webhook with invalid JSON body');
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const notification = body as { type?: string; data?: { id?: string | number } };

	log.debug({ type: notification.type, dataId: notification.data?.id }, 'Webhook received');

	// Only handle payment notifications
	if (notification.type !== 'payment' || !notification.data?.id) {
		log.debug({ type: notification.type }, 'Ignoring non-payment webhook notification');
		return new Response(null, { status: 200 });
	}

	const paymentId = String(notification.data.id);
	const webhookLog = log.child({ mpPaymentId: paymentId });

	try {
		const client = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });

		// Orders API payment IDs are alphanumeric (e.g. "PAY01...").
		// Classic Payments API uses numeric IDs. Route accordingly.
		const isOrdersApiPayment = /\D/.test(paymentId);

		let mpStatus: string;
		let mpStatusDetail: string | null = null;
		let pixQrCode: string | null = null;
		let pixQrCodeBase64: string | null = null;
		let mpOrderStatus: string | null = null;
		let localOrderId: string | null = null;

		if (isOrdersApiPayment) {
			// Look up the mp_order_id via our DB since the Orders API doesn't expose
			// a payment-level GET endpoint.
			const supabaseForLookup = createSupabaseAdminClient();
			const { data: paymentRow } = await supabaseForLookup
				.from('payments')
				.select('order_id')
				.eq('mp_payment_id', paymentId)
				.maybeSingle();

			if (!paymentRow?.order_id) {
				webhookLog.warn('No local payment record found for Orders API payment, skipping');
				return new Response(null, { status: 200 });
			}

			localOrderId = paymentRow.order_id;

			const { data: orderRow } = await supabaseForLookup
				.from('orders')
				.select('mp_order_id')
				.eq('id', localOrderId)
				.maybeSingle();

			if (!orderRow?.mp_order_id) {
				webhookLog.warn('No mp_order_id found for order, skipping');
				return new Response(null, { status: 200 });
			}

			webhookLog.info({ mpOrderId: orderRow.mp_order_id }, 'Fetching order details from MP Orders API');
			const orderClient = new MpOrder(client);
			const mpOrder = await orderClient.get({ id: orderRow.mp_order_id });

			mpOrderStatus = mpOrder.status ?? null;

			const mpPaymentEntry = mpOrder.transactions?.payments?.find((p: any) => p.id === paymentId);
			if (!mpPaymentEntry) {
				webhookLog.warn({ mpOrderId: orderRow.mp_order_id }, 'Payment entry not found inside MP order');
				return new Response(null, { status: 200 });
			}

			mpStatus = mpPaymentEntry.status ?? 'unknown';
			mpStatusDetail = mpPaymentEntry.status_detail ?? null;
			webhookLog.info(
				{ mpStatus, mpOrderStatus, externalRef: mpOrder.external_reference },
				'Payment details fetched via Orders API'
			);
		} else {
			webhookLog.info('Fetching payment details from MP classic Payments API');
			const paymentClient = new Payment(client);
			const mpPayment = await paymentClient.get({ id: paymentId });

			if (!mpPayment?.external_reference) {
				webhookLog.warn('Payment has no external_reference, skipping');
				return new Response(null, { status: 200 });
			}

			mpStatus = mpPayment.status ?? 'unknown';
			mpStatusDetail = mpPayment.status_detail ?? null;

			const pixData = (
				mpPayment as unknown as {
					point_of_interaction?: {
						transaction_data?: { qr_code?: string; qr_code_base64?: string };
					};
				}
			).point_of_interaction?.transaction_data;
			pixQrCode = pixData?.qr_code ?? null;
			pixQrCodeBase64 = pixData?.qr_code_base64 ?? null;

			webhookLog.info({ mpStatus, externalRef: mpPayment.external_reference }, 'Payment details fetched');
		}

		const supabase = createSupabaseAdminClient();

		await updateOrderStatusByPaymentId(supabase, paymentId, mpStatus);
		webhookLog.info({ mpStatus }, 'Order status updated');

		// Also sync the MP order-level status onto the orders record when available
		if (localOrderId && mpOrderStatus) {
			const { error: orderSyncErr } = await supabase
				.from('orders')
				.update({ mp_status: mpOrderStatus })
				.eq('id', localOrderId);
			if (orderSyncErr) {
				webhookLog.error({ err: orderSyncErr }, 'Failed to sync mp_status on order');
			} else {
				webhookLog.info({ mpOrderStatus }, 'Order mp_status synced from Orders API');
			}
		}

		const { error: paymentUpdateErr } = await supabase
			.from('payments')
			.update({
				mp_status: mpStatus,
				mp_status_detail: mpStatusDetail,
				pix_qr_code: pixQrCode,
				pix_qr_code_base64: pixQrCodeBase64
			})
			.eq('mp_payment_id', paymentId);

		if (paymentUpdateErr) {
			webhookLog.error({ err: paymentUpdateErr }, 'Failed to update payment record');
		} else {
			webhookLog.info('Payment record updated');
		}
	} catch (err) {
		webhookLog.error({ err }, 'Unexpected error processing webhook');
		// Return 200 so MP doesn't keep retrying for non-critical errors
	}

	return new Response(null, { status: 200 });
};
