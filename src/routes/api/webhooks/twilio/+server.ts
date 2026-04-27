import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import twilio from 'twilio';
import { TWILIO_AUTH_TOKEN } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import logger from '$lib/server/logger';

const log = logger.child({ module: 'webhook.twilio' });

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const signature = request.headers.get('X-Twilio-Signature') ?? '';
	const url = request.url;

	const isValid = twilio.validateRequest(
		TWILIO_AUTH_TOKEN,
		signature,
		url,
		Object.fromEntries(new URLSearchParams(body))
	);

	if (!isValid) {
		log.warn({ url }, 'Twilio webhook received with invalid signature');
		return json({ error: 'Invalid signature' }, { status: 403 });
	}

	const params = new URLSearchParams(body);
	const messageSid = params.get('MessageSid');
	const messageStatus = params.get('MessageStatus');

	log.debug({ messageSid, messageStatus }, 'Twilio status callback received');

	if (!messageSid || !messageStatus) {
		return json({ ok: true });
	}

	if (messageStatus === 'delivered') {
		const admin = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error: dbErr } = await (admin.from('appointments') as any)
			.update({ whatsapp_notified: true })
			.eq('notification_sid', messageSid);

		if (dbErr) {
			log.error({ err: dbErr, messageSid }, 'Failed to update appointment whatsapp_notified flag');
		} else {
			log.info({ messageSid }, 'Appointment marked as WhatsApp notified via Twilio callback');
		}
	} else {
		log.debug({ messageSid, messageStatus }, 'Twilio message status update (not delivered)');
	}

	return json({ ok: true });
};
