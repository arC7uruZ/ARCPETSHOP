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

	const team = [
		{
			name: 'Ana Paula Ferreira',
			role: 'Veterinária Chefe',
			bio: 'Formada pela USP com especialização em clínica de pequenos animais. Mais de 10 anos dedicados ao bem-estar animal.',
			emoji: '👩‍⚕️',
			specialties: ['Clínica geral', 'Vacinação', 'Cirurgia']
		},
		{
			name: 'Carlos Mendes',
			role: 'Tosador & Banhista Sênior',
			bio: 'Certificado pela Escola Brasileira de Grooming. Especialista em raças de pelo longo e cortes estéticos de alta precisão.',
			emoji: '✂️',
			specialties: ['Banho e tosa', 'Cortes especiais', 'Hidratação']
		},
		{
			name: 'Juliana Costa',
			role: 'Adestradora Comportamental',
			bio: 'Pós-graduada em etologia e bem-estar animal. Utiliza métodos positivos para transformar a relação entre tutores e pets.',
			emoji: '🐕',
			specialties: ['Adestramento', 'Socialização', 'Comportamento']
		},
		{
			name: 'Rafael Souza',
			role: 'Auxiliar Veterinário',
			bio: 'Estudante de medicina veterinária com paixão por cuidados preventivos. Responsável pela hospedagem e monitoramento dos pets.',
			emoji: '🩺',
			specialties: ['Hospedagem', 'Cuidados pós-operatórios', 'Vacinação']
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
		<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each team as member}
				<div
					class="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
				>
					<div
						class="bg-primary-100 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
					>
						{member.emoji}
					</div>
					<h3 class="font-bold text-gray-900">{member.name}</h3>
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
