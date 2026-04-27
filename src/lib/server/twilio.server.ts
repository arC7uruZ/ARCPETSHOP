import twilio from 'twilio';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } from '$env/static/private';
import { buildBookingWhatsAppMessage } from '$lib/utils/whatsapp.utils';
import logger from '$lib/server/logger';

const log = logger.child({ module: 'twilio.server' });

const getClient = () => twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export interface BookingNotificationParams {
	toPhone: string;
	userName: string;
	petName: string;
	serviceName: string;
	scheduledAt: string;
}

export async function sendBookingConfirmation(
	params: BookingNotificationParams
): Promise<string | null> {
	const phoneE164 = normalizeToE164(params.toPhone);
	if (!phoneE164) {
		log.warn({ rawPhone: params.toPhone }, 'Invalid phone number, skipping WhatsApp notification');
		return null;
	}

	try {
		const client = getClient();
		log.debug({ to: phoneE164 }, 'Sending WhatsApp booking confirmation');

		const message = await client.messages.create({
			from: TWILIO_WHATSAPP_FROM,
			to: `whatsapp:${phoneE164}`,
			body: buildBookingWhatsAppMessage(params)
		});

		log.info({ sid: message.sid, status: message.status, to: phoneE164 }, 'WhatsApp message sent');
		return message.sid;
	} catch (err) {
		log.error({ err, to: phoneE164 }, 'Failed to send WhatsApp message via Twilio');
		return null;
	}
}

function normalizeToE164(phone: string): string | null {
	const digits = phone.replace(/\D/g, '');
	if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`;
	if (digits.length === 11) return `+55${digits}`;
	if (digits.length === 10) return `+55${digits}`;
	return null;
}
