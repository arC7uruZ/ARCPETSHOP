<script lang="ts">
	import { clsx } from 'clsx';
	import { siteConfig } from '$lib/config/site.config';
	import Button from '$lib/components/ui/Button.svelte';
	import { Heart, Award, Users, Clock, MapPin, Phone } from 'lucide-svelte';

	const stats = [
		{ value: '2.000+', label: 'Pets atendidos', icon: Heart },
		{ value: '5 anos', label: 'De experiência', icon: Award },
		{ value: '8 profissionais', label: 'Especializados', icon: Users },
		{ value: '6 dias', label: 'Por semana', icon: Clock }
	];

	const teamCategories = [
		{
			label: 'Veterinários',
			emoji: '🩺',
			members: [
				{
					name: 'Ana Paula Ferreira',
					role: 'Veterinária Chefe',
					bio: 'Formada pela USP com especialização em clínica de pequenos animais. Mais de 10 anos dedicados ao bem-estar animal.',
					photo: 'https://randomuser.me/api/portraits/women/44.jpg',
					specialties: ['Clínica geral', 'Vacinação', 'Cirurgia']
				},
				{
					name: 'Bruno Almeida',
					role: 'Médico Veterinário',
					bio: 'Especializado em dermatologia veterinária e nutrição animal. Atua com diagnóstico por imagem e exames laboratoriais.',
					photo: 'https://randomuser.me/api/portraits/men/32.jpg',
					specialties: ['Dermatologia', 'Nutrição', 'Diagnóstico']
				}
			]
		},
		{
			label: 'Cuidadores',
			emoji: '🐾',
			members: [
				{
					name: 'Mariana Lima',
					role: 'Cuidadora Sênior',
					bio: 'Com 6 anos de experiência em hospedagem e cuidados especiais, garante que cada pet se sinta em casa durante a estadia.',
					photo: 'https://randomuser.me/api/portraits/women/65.jpg',
					specialties: ['Hospedagem', 'Cuidados noturnos', 'Pets idosos']
				},
				{
					name: 'Diego Santos',
					role: 'Cuidador & Adestradora',
					bio: 'Combina técnicas de adestramento positivo com cuidados diários. Especialista em socialização de filhotes.',
					photo: 'https://randomuser.me/api/portraits/men/54.jpg',
					specialties: ['Adestramento', 'Socialização', 'Filhotes']
				},
				{
					name: 'Fernanda Rocha',
					role: 'Cuidadora',
					bio: 'Apaixonada por animais desde pequena, cuida com atenção individualizada de cada pet hospedado, monitorando saúde e bem-estar.',
					photo: 'https://randomuser.me/api/portraits/women/28.jpg',
					specialties: ['Monitoramento', 'Medicação', 'Relatórios diários']
				}
			]
		},
		{
			label: 'Auxiliares Veterinários',
			emoji: '🔬',
			members: [
				{
					name: 'Rafael Souza',
					role: 'Auxiliar Veterinário',
					bio: 'Estudante de medicina veterinária com paixão por cuidados preventivos. Responsável pela hospedagem e monitoramento dos pets.',
					photo: 'https://randomuser.me/api/portraits/men/76.jpg',
					specialties: ['Cuidados pós-op.', 'Vacinação', 'Triagem']
				},
				{
					name: 'Letícia Cunha',
					role: 'Auxiliar Veterinária',
					bio: 'Formanda em medicina veterinária, atua no apoio às consultas e procedimentos clínicos com muita dedicação e cuidado.',
					photo: 'https://randomuser.me/api/portraits/women/17.jpg',
					specialties: ['Apoio clínico', 'Coleta de exames', 'Esterilização']
				}
			]
		},
		{
			label: 'Tosadores & Banhistas',
			emoji: '✂️',
			members: [
				{
					name: 'Carlos Mendes',
					role: 'Tosador & Banhista Sênior',
					bio: 'Certificado pela Escola Brasileira de Grooming. Especialista em raças de pelo longo e cortes estéticos de alta precisão.',
					photo: 'https://randomuser.me/api/portraits/men/11.jpg',
					specialties: ['Banho e tosa', 'Cortes especiais', 'Hidratação']
				},
				{
					name: 'Priscila Nunes',
					role: 'Banhista & Tosadora',
					bio: 'Especializada em pets de pequeno porte e raças exóticas. Usa produtos naturais e hipoalergênicos para cuidados delicados.',
					photo: 'https://randomuser.me/api/portraits/women/56.jpg',
					specialties: ['Banho terapêutico', 'Raças pequenas', 'Hidratação']
				},
				{
					name: 'Thiago Barbosa',
					role: 'Tosador',
					bio: 'Expert em cortes artísticos e funcionais. Participou de campeonatos regionais de grooming e traz tendências internacionais ao salão.',
					photo: 'https://randomuser.me/api/portraits/men/43.jpg',
					specialties: ['Cortes artísticos', 'Golden Retriever', 'Poodle']
				}
			]
		},
		{
			label: 'Motoristas (Pet Taxi)',
			emoji: '🚗',
			members: [
				{
					name: 'Edson Carvalho',
					role: 'Motorista Pet Taxi',
					bio: 'Habilitado para transporte seguro de animais, com veículo adaptado e climatizado. Cuidadoso e pontual em cada corrida.',
					photo: 'https://randomuser.me/api/portraits/men/62.jpg',
					specialties: ['Transporte seguro', 'Veículo adaptado', 'Consultas e banho']
				},
				{
					name: 'Roberta Melo',
					role: 'Motorista Pet Taxi',
					bio: 'Amante de animais que faz de cada viagem uma experiência tranquila. Atende rotas na zona sul e centro da cidade.',
					photo: 'https://randomuser.me/api/portraits/women/33.jpg',
					specialties: ['Zona sul', 'Centro', 'Emergências']
				}
			]
		}
	];

	const timeline = [
		{
			year: '2019',
			title: 'O começo de tudo',
			desc: 'A ArcPetShop nasceu de um sonho simples: oferecer um lugar onde todo pet fosse tratado com o mesmo carinho que recebe em casa. Abrimos nossas portas com dois profissionais e muita vontade.'
		},
		{
			year: '2021',
			title: 'Crescimento e reconhecimento',
			desc: 'Com a confiança crescente dos tutores da região, expandimos nossa equipe e inauguramos o espaço de hospedagem pet. Neste ano, recebemos o prêmio de melhor petshop da zona sul de São Paulo.'
		},
		{
			year: '2023',
			title: 'Clínica veterinária própria',
			desc: 'Abrimos nossa própria clínica veterinária no mesmo espaço, trazendo a Dra. Ana Paula para liderar os cuidados de saúde. Hoje oferecemos atendimento completo, do banho à cirurgia.'
		},
		{
			year: '2024',
			title: 'Agendamento online',
			desc: 'Lançamos nossa plataforma digital para facilitar a vida dos tutores. Agendamento em minutos, acompanhamento em tempo real e muito mais conforto para você e seu pet.'
		}
	];
</script>

<svelte:head>
	<title>Quem Somos — {siteConfig.name}</title>
	<meta
		name="description"
		content="Conheça a história da ArcPetShop, nossa equipe de profissionais apaixonados e nosso compromisso com o bem-estar animal."
	/>
</svelte:head>

<!-- Hero -->
<div class="from-primary-500 to-secondary-500 bg-linear-to-br pt-32 pb-20">
	<div class="container-app text-center text-white">
		<div
			class="bg-white/20 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-sm"
		>
			<span>🐾</span>
			<span>Nossa história</span>
		</div>
		<h1 class="font-display text-4xl font-bold sm:text-5xl">Quem Somos</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-white/85">
			Somos uma equipe apaixonada por animais, comprometida em oferecer cuidados de excelência para
			o seu pet — com carinho, técnica e muita dedicação.
		</p>
	</div>
</div>

<!-- Stats -->
<div class="bg-white">
	<div class="container-app">
		<div class="-mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
			{#each stats as stat}
				<div
					class="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-md"
				>
					<div class="bg-primary-100 flex h-12 w-12 items-center justify-center rounded-xl">
						<stat.icon class="text-primary-600 h-6 w-6" />
					</div>
					<div>
						<div class="font-display text-primary-600 text-2xl font-bold">{stat.value}</div>
						<div class="mt-0.5 text-sm text-gray-500">{stat.label}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Nossa história -->
<section class="section bg-gray-50">
	<div class="container-app">
		<div class="grid items-center gap-12 lg:grid-cols-2">
			<div>
				<h2 class="section-title text-left">Nossa história</h2>
				<p class="mt-4 leading-relaxed text-gray-600">
					A <strong>{siteConfig.name}</strong> nasceu em 2019 da paixão de dois amigos veterinários
					que queriam fazer diferente: criar um espaço onde os animais se sentissem acolhidos, não apenas
					atendidos.
				</p>
				<p class="mt-4 leading-relaxed text-gray-600">
					Começamos pequenos, mas com um propósito grande. Ao longo dos anos, fomos crescendo junto
					com a confiança das famílias que nos escolheram para cuidar de seus pets — e isso nos move
					todos os dias.
				</p>
				<p class="mt-4 leading-relaxed text-gray-600">
					Hoje somos um time completo, com veterinários, tosadores, adestradores e cuidadores que
					compartilham o mesmo amor pelos animais. Cada pet que passa por aqui é tratado como parte
					da nossa família.
				</p>
				<div class="mt-8">
					<Button variant="primary" size="lg" href="/booking">Agendar uma visita</Button>
				</div>
			</div>

			<!-- Timeline -->
			<div class="space-y-6">
				{#each timeline as item, i}
					<div class="flex gap-4">
						<div class="flex flex-col items-center">
							<div
								class={clsx(
									'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
									'bg-primary-500 text-sm font-bold text-white'
								)}
							>
								{item.year.slice(2)}
							</div>
							{#if i < timeline.length - 1}
								<div class="bg-primary-200 mt-1 w-0.5 flex-1"></div>
							{/if}
						</div>
						<div class={clsx('pb-6', i === timeline.length - 1 && 'pb-0')}>
							<div class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
								{item.year}
							</div>
							<h3 class="mt-0.5 font-semibold text-gray-900">{item.title}</h3>
							<p class="mt-1 text-sm leading-relaxed text-gray-500">{item.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Nossos valores -->
<section class="section bg-white">
	<div class="container-app">
		<div class="text-center">
			<h2 class="section-title">Nossos valores</h2>
			<p class="section-subtitle mx-auto max-w-xl">
				Tudo o que fazemos é guiado por princípios que colocam o bem-estar animal em primeiro lugar.
			</p>
		</div>
		<div class="mt-12 grid gap-6 sm:grid-cols-3">
			<div class="rounded-2xl border border-gray-100 p-6 shadow-sm">
				<div class="mb-4 text-4xl">❤️</div>
				<h3 class="mb-2 font-bold text-gray-900">Amor genuíno</h3>
				<p class="text-sm leading-relaxed text-gray-500">
					Cada animal que chega aqui é recebido com afeto real. Não é rotina — é vocação.
				</p>
			</div>
			<div class="rounded-2xl border border-gray-100 p-6 shadow-sm">
				<div class="mb-4 text-4xl">🎓</div>
				<h3 class="mb-2 font-bold text-gray-900">Técnica e preparo</h3>
				<p class="text-sm leading-relaxed text-gray-500">
					Nossa equipe se atualiza constantemente. Técnica e sensibilidade andam sempre juntas.
				</p>
			</div>
			<div class="rounded-2xl border border-gray-100 p-6 shadow-sm">
				<div class="mb-4 text-4xl">🔒</div>
				<h3 class="mb-2 font-bold text-gray-900">Transparência total</h3>
				<p class="text-sm leading-relaxed text-gray-500">
					Você sempre sabe o que está acontecendo com seu pet. Comunicação clara, sem surpresas.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Equipe -->
<section class="section bg-gray-50">
	<div class="container-app">
		<div class="text-center">
			<h2 class="section-title">Nossa equipe</h2>
			<p class="section-subtitle mx-auto max-w-xl">
				Profissionais apaixonados que fazem a diferença na vida de cada pet que atendemos.
			</p>
		</div>

		<div class="mt-12 space-y-16">
			{#each teamCategories as category}
				<div>
					<!-- Category header -->
					<div class="mb-6 flex items-center gap-3">
						<span class="text-2xl">{category.emoji}</span>
						<h3 class="font-display text-xl font-bold text-gray-900">{category.label}</h3>
						<div class="h-px flex-1 bg-gray-200"></div>
					</div>

					<!-- Members grid -->
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each category.members as member}
							<div
								class="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
							>
								<img
									src={member.photo}
									alt={member.name}
									class="mb-4 h-20 w-20 rounded-2xl object-cover"
								/>
								<h4 class="font-bold text-gray-900">{member.name}</h4>
								<p class="text-primary-600 mt-0.5 text-sm font-medium">{member.role}</p>
								<p class="mt-3 flex-1 text-sm leading-relaxed text-gray-500">{member.bio}</p>
								<div class="mt-4 flex flex-wrap gap-1.5">
									{#each member.specialties as s}
										<span class="bg-primary-50 text-primary-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
											{s}
										</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Localização e contato -->
<section class="section bg-white">
	<div class="container-app">
		<div class="grid items-center gap-10 lg:grid-cols-2">
			<div>
				<h2 class="section-title text-left">Venha nos visitar</h2>
				<p class="mt-3 leading-relaxed text-gray-600">
					Adoraríamos conhecer você e seu pet pessoalmente. Estamos localizados no coração do bairro,
					com fácil acesso e estacionamento próximo.
				</p>
				<ul class="mt-6 space-y-4">
					<li class="flex items-start gap-3">
						<MapPin class="text-primary-500 mt-0.5 h-5 w-5 shrink-0" />
						<div>
							<p class="font-medium text-gray-900">Endereço</p>
							<p class="text-sm text-gray-500">
								{siteConfig.address.street}, {siteConfig.address.neighborhood}<br />
								{siteConfig.address.city} — {siteConfig.address.state}, {siteConfig.address.zip}
							</p>
						</div>
					</li>
					<li class="flex items-start gap-3">
						<Clock class="text-primary-500 mt-0.5 h-5 w-5 shrink-0" />
						<div>
							<p class="font-medium text-gray-900">Horário de funcionamento</p>
							<p class="text-sm text-gray-500">{siteConfig.openingHours}</p>
						</div>
					</li>
					<li class="flex items-start gap-3">
						<Phone class="text-primary-500 mt-0.5 h-5 w-5 shrink-0" />
						<div>
							<p class="font-medium text-gray-900">Telefone</p>
							<p class="text-sm text-gray-500">{siteConfig.phone}</p>
						</div>
					</li>
				</ul>
				<div class="mt-8 flex flex-wrap gap-3">
					<Button variant="primary" size="lg" href="/booking">Agendar agora</Button>
					<Button variant="outline" size="lg" href="/services">Ver serviços</Button>
				</div>
			</div>

			<!-- Map placeholder -->
			<div
				class={clsx(
					'flex h-72 items-center justify-center rounded-2xl lg:h-96',
					'from-primary-100 to-secondary-100 bg-linear-to-br',
					'border border-gray-100'
				)}
			>
				<div class="text-center text-gray-400">
					<MapPin class="mx-auto mb-3 h-10 w-10 text-gray-300" />
					<p class="text-sm font-medium">
						{siteConfig.address.street}
					</p>
					<p class="text-xs">{siteConfig.address.neighborhood}, {siteConfig.address.city}</p>
				</div>
			</div>
		</div>
	</div>
</section>
