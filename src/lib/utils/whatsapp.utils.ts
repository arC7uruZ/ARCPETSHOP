import { siteConfig } from '$lib/config/site.config';

/**
 * Builds a WhatsApp click-to-chat URL.
 * @param number - Phone number in international format without +, e.g. "5511999999999"
 * @param message - Optional pre-filled message text
 */
export const buildWhatsAppUrl = (number: string, message?: string): string => {
	const base = `https://wa.me/${number}`;
	if (!message) return base;
	return `${base}?text=${encodeURIComponent(message)}`;
};

/**
 * Builds a default WhatsApp CTA URL using the site config.
 */
export const getDefaultWhatsAppUrl = (customMessage?: string): string =>
	buildWhatsAppUrl(siteConfig.whatsappNumber, customMessage ?? siteConfig.whatsappDefaultMessage);

/**
 * Builds a booking confirmation WhatsApp message.
 */
export const buildBookingWhatsAppMessage = (params: {
	userName: string;
	petName: string;
	serviceName: string;
	scheduledAt: string;
}): string => {
	const date = new Date(params.scheduledAt).toLocaleDateString('pt-BR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	});
	const time = new Date(params.scheduledAt).toLocaleTimeString('pt-BR', {
		hour: '2-digit',
		minute: '2-digit'
	});

	return (
		`Olá ${params.userName}! 🐾\n\n` +
		`Seu agendamento foi confirmado:\n` +
		`📋 *Serviço:* ${params.serviceName}\n` +
		`🐕 *Pet:* ${params.petName}\n` +
		`📅 *Data:* ${date}\n` +
		`🕐 *Horário:* ${time}\n\n` +
		`Caso precise cancelar ou reagendar, entre em contato conosco.\n` +
		`_ArcPetShop — Cuidado e amor para o seu pet_ 🐾`
	);
};
