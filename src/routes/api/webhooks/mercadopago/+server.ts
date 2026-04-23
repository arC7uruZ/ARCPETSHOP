import { json } from '@sveltejs/kit';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { MERCADOPAGO_ACCESS_TOKEN } from '$env/static/private';
import { updateOrderStatusByPaymentId, storePayment } from '$lib/server/orders.server';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase/server';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const notification = body as { type?: string; data?: { id?: string | number } };

	// Only handle payment notifications
	if (notification.type !== 'payment' || !notification.data?.id) {
		return new Response(null, { status: 200 });
	}

	const paymentId = String(notification.data.id);

	try {
		const client = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });
		const paymentClient = new Payment(client);
		const mpPayment = await paymentClient.get({ id: paymentId });

		if (!mpPayment?.external_reference) {
			return new Response(null, { status: 200 });
		}

		// Use admin client (bypasses RLS) for webhook updates
		const supabase = createSupabaseAdminClient();

		// Update order status
		await updateOrderStatusByPaymentId(supabase, paymentId, mpPayment.status ?? 'unknown');

		// Update payment record
		const pixData = (
			mpPayment as unknown as {
				point_of_interaction?: {
					transaction_data?: { qr_code?: string; qr_code_base64?: string; ticket_url?: string };
				};
			}
		).point_of_interaction?.transaction_data;

		const { error: paymentUpdateErr } = await supabase
			.from('payments')
			.update({
				mp_status: mpPayment.status ?? 'unknown',
				mp_status_detail: mpPayment.status_detail ?? null,
				pix_qr_code: pixData?.qr_code ?? null,
				pix_qr_code_base64: pixData?.qr_code_base64 ?? null
			})
			.eq('mp_payment_id', paymentId);

		if (paymentUpdateErr) {
			console.error('Failed to update payment record:', paymentUpdateErr);
		}
	} catch (err) {
		console.error('Webhook processing error:', err);
		// Return 200 so MP doesn't keep retrying for non-critical errors
	}

	return new Response(null, { status: 200 });
};
