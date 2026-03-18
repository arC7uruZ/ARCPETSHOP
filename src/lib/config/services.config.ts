export interface ServiceConfig {
	slug: string;
	name: string;
	shortDesc: string;
	description: string;
	priceFrom: number;
	durationMin: number;
	icon: string;
	emoji: string;
	features: string[];
	imageUrl: string;
	whatsappMessage: string;
}

export const SERVICES_CONFIG: ServiceConfig[] = [
	{
		slug: 'banho-tosa',
		name: 'Banho e Tosa',
		shortDesc: 'Banho completo com tosa e perfume.',
		description:
			'Serviço completo de banho e tosa para cães e gatos de todos os portes. Inclui banho com shampoo especializado, secagem, tosa higiênica ou na tesoura, corte de unhas, limpeza de ouvidos e perfume.',
		priceFrom: 45,
		durationMin: 90,
		icon: 'Scissors',
		emoji: '✂️',
		features: [
			'Banho com shampoo especializado',
			'Secagem completa',
			'Tosa higiênica ou decorativa',
			'Corte de unhas',
			'Limpeza de ouvidos',
			'Perfume e laço'
		],
		imageUrl: '/images/services/banho-tosa.webp',
		whatsappMessage: 'Olá! Gostaria de agendar um *Banho e Tosa* para meu pet.'
	},
	{
		slug: 'consulta-veterinaria',
		name: 'Consulta Veterinária',
		shortDesc: 'Avaliação completa com veterinário.',
		description:
			'Consulta clínica geral com veterinário especializado. Avaliação completa de saúde, diagnóstico, prescrição e orientações. Atendemos cães, gatos e pequenos animais com toda atenção que seu pet merece.',
		priceFrom: 120,
		durationMin: 45,
		icon: 'Stethoscope',
		emoji: '🩺',
		features: [
			'Avaliação clínica completa',
			'Diagnóstico especializado',
			'Prescrição de medicamentos',
			'Orientações de saúde',
			'Encaminhamento para exames',
			'Prontuário digital'
		],
		imageUrl: '/images/services/consulta-veterinaria.webp',
		whatsappMessage: 'Olá! Gostaria de agendar uma *Consulta Veterinária* para meu pet.'
	},
	{
		slug: 'vacinacao',
		name: 'Vacinação',
		shortDesc: 'Vacinas essenciais com carteirinha.',
		description:
			'Aplicação de vacinas essenciais: V8, V10, Antirrábica, Gripe Canina, Giardia e outras. Realizamos o calendário completo de vacinação com carteirinha atualizada e lembretes para os próximos reforços.',
		priceFrom: 80,
		durationMin: 20,
		icon: 'Syringe',
		emoji: '💉',
		features: [
			'Vacinas V8 e V10',
			'Antirrábica',
			'Gripe canina e felina',
			'Carteirinha atualizada',
			'Lembretes de reforço',
			'Aplicação por veterinário'
		],
		imageUrl: '/images/services/vacinacao.webp',
		whatsappMessage: 'Olá! Gostaria de agendar a *Vacinação* do meu pet.'
	},
	{
		slug: 'hospedagem-pet',
		name: 'Hospedagem Pet',
		shortDesc: 'Hotel confortável com cuidados 24h.',
		description:
			'Hotel para pets com acomodações individuais e confortáveis, alimentação personalizada conforme orientação do tutor, monitoramento 24h por câmeras, atividades recreativas e relatório diário para você.',
		priceFrom: 80,
		durationMin: 1440,
		icon: 'Home',
		emoji: '🏨',
		features: [
			'Acomodações individuais',
			'Alimentação personalizada',
			'Monitoramento 24h',
			'Atividades recreativas',
			'Relatório diário',
			'Câmeras ao vivo'
		],
		imageUrl: '/images/services/hospedagem-pet.webp',
		whatsappMessage: 'Olá! Gostaria de reservar a *Hospedagem* para meu pet.'
	},
	{
		slug: 'adestramento',
		name: 'Adestramento',
		shortDesc: 'Treinamento positivo e socialização.',
		description:
			'Treinamento comportamental positivo para cães. Ensinamos comandos básicos, controle de ansiedade, socialização com outros animais e pessoas, e correção de comportamentos indesejados com técnicas modernas e éticas.',
		priceFrom: 150,
		durationMin: 60,
		icon: 'GraduationCap',
		emoji: '🎓',
		features: [
			'Comandos básicos e avançados',
			'Controle de ansiedade',
			'Socialização',
			'Correção comportamental',
			'Técnica de reforço positivo',
			'Acompanhamento do tutor'
		],
		imageUrl: '/images/services/adestramento.webp',
		whatsappMessage: 'Olá! Gostaria de agendar uma sessão de *Adestramento* para meu pet.'
	},
	{
		slug: 'pet-taxi',
		name: 'Pet Taxi',
		shortDesc: 'Transporte seguro de porta a porta.',
		description:
			'Transporte seguro e confortável para seu pet. Buscamos e levamos para consultas, banho, cirurgias ou qualquer destino dentro da cidade. Veículo adaptado com gaiolas seguras e motorista treinado em primeiros socorros.',
		priceFrom: 35,
		durationMin: 30,
		icon: 'Car',
		emoji: '🚗',
		features: [
			'Busca e entrega na sua casa',
			'Veículo adaptado para pets',
			'Gaiolas e cinto de segurança',
			'Motorista treinado',
			'Rastreamento em tempo real',
			'Agendamento flexível'
		],
		imageUrl: '/images/services/pet-taxi.webp',
		whatsappMessage: 'Olá! Gostaria de contratar o *Pet Taxi* para meu pet.'
	}
];

export const getServiceConfig = (slug: string): ServiceConfig | undefined =>
	SERVICES_CONFIG.find((s) => s.slug === slug);
