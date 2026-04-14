import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import twilio from 'twilio';
import { TWILIO_AUTH_TOKEN } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

/**
 * Twilio status callback webhook.
 * Updates the appointment record when Twilio delivers (or fails) a WhatsApp message.
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const signature = request.headers.get('X-Twilio-Signature') ?? '';
	const url = request.url;

	// Validate Twilio signature
	const isValid = twilio.validateRequest(
		TWILIO_AUTH_TOKEN,
		signature,
		url,
		Object.fromEntries(new URLSearchParams(body))
	);
	if (!isValid) {
		return json({ error: 'Invalid signature' }, { status: 403 });
	}

	const params = new URLSearchParams(body);
	const messageSid = params.get('MessageSid');
	const messageStatus = params.get('MessageStatus');

	if (!messageSid || !messageStatus) {
		return json({ ok: true });
	}

	// Update appointment notification status
	const admin = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
	if (messageStatus === 'delivered') {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await (admin.from('appointments') as any)
			.update({ whatsapp_notified: true })
			.eq('notification_sid', messageSid);
	}

	return json({ ok: true });
};
