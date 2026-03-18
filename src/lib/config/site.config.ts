import { env } from '$env/dynamic/public';

export const siteConfig = {
	name: env.PUBLIC_SITE_NAME ?? 'ArcPetShop',
	description: 'Cuidado e amor para o seu pet. Serviços de qualidade com profissionais dedicados.',
	url: env.PUBLIC_SITE_URL ?? 'http://localhost:5173',
	whatsappNumber: env.PUBLIC_WHATSAPP_NUMBER ?? '5511999999999',
	whatsappDefaultMessage:
		env.PUBLIC_WHATSAPP_DEFAULT_MESSAGE ??
		'Olá! Gostaria de agendar um serviço para meu pet.',
	socialLinks: {
		instagram: 'https://instagram.com/arcpetshop',
		facebook: 'https://facebook.com/arcpetshop'
	},
	address: {
		street: 'Rua dos Pets, 123',
		neighborhood: 'Centro',
		city: 'São Paulo',
		state: 'SP',
		zip: '01310-100'
	},
	phone: '+55 (11) 9999-9999',
	email: 'contato@arcpetshop.com.br',
	openingHours: 'Segunda a Sábado: 8h às 19h | Domingos: 9h às 17h'
} as const;

export type SiteConfig = typeof siteConfig;
