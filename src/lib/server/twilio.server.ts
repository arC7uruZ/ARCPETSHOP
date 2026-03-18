import twilio from 'twilio';
import {
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
	TWILIO_WHATSAPP_FROM
} from '$env/static/private';
import { buildBookingWhatsAppMessage } from '$lib/utils/whatsapp.utils';

const getClient = () => twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export interface BookingNotificationParams {
	toPhone: string;
	userName: string;
	petName: string;
	serviceName: string;
	scheduledAt: string;
}

/**
 * Sends a WhatsApp booking confirmation notification via Twilio.
 * Returns the Twilio message SID on success, or null on failure.
 */
export async function sendBookingConfirmation(
	params: BookingNotificationParams
): Promise<string | null> {
	const phoneE164 = normalizeToE164(params.toPhone);
	if (!phoneE164) {
		console.warn('[Twilio] Invalid phone number:', params.toPhone);
		return null;
	}

	try {
		const client = getClient();
		const message = await client.messages.create({
			from: TWILIO_WHATSAPP_FROM,
			to: `whatsapp:${phoneE164}`,
			body: buildBookingWhatsAppMessage(params)
		});
		return message.sid;
	} catch (err) {
		console.error('[Twilio] Failed to send WhatsApp message:', err);
		return null;
	}
}

/**
 * Normalizes a Brazilian phone number to E.164 format.
 * e.g. "(11) 99999-9999" → "+5511999999999"
 */
function normalizeToE164(phone: string): string | null {
	const digits = phone.replace(/\D/g, '');
	if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`;
	if (digits.length === 11) return `+55${digits}`;
	if (digits.length === 10) return `+55${digits}`;
	return null;
}
