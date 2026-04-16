<script lang="ts">
	import { clsx } from 'clsx';

	const features = [
		{
			emoji: '👨‍⚕️',
			title: 'Equipe Especializada',
			description:
				'Veterinários e groommers certificados com anos de experiência no cuidado animal.'
		},
		{
			emoji: '🏥',
			title: 'Estrutura Completa',
			description:
				'Instalações modernas e equipadas com tecnologia de ponta para o melhor atendimento.'
		},
		{
			emoji: '❤️',
			title: 'Cuidado com Amor',
			description: 'Tratamos cada pet como um membro da família, com carinho e dedicação.'
		},
		{
			emoji: '📱',
			title: 'Agendamento Online',
			description: 'Agende serviços pelo site ou WhatsApp com facilidade, de onde você estiver.'
		},
		{
			emoji: '🔔',
			title: 'Notificações WhatsApp',
			description: 'Receba confirmações e lembretes de agendamento diretamente no seu WhatsApp.'
		},
		{
			emoji: '⭐',
			title: 'Qualidade Garantida',
			description: 'Satisfação garantida em todos os serviços. Seu pet bem cuidado ou devolvemos.'
		}
	];
</script>

<section class="section bg-white">
	<div class="container-app">
		<div class="text-center">
			<h2 class="section-title">Por que nos escolher?</h2>
			<p class="section-subtitle mx-auto max-w-2xl">
				Somos o pet shop de confiança da região. Descubra o que nos torna especiais.
			</p>
		</div>

		<div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature}
				<div class="flex gap-4">
					<div
						class={clsx(
						'flex h-12 w-12 shrink-0 items-center justify-center',
						'rounded-2xl bg-primary-100 text-2xl',
					)}
					>
						{feature.emoji}
					</div>
					<div>
						<h3 class="mb-1.5 font-semibold text-gray-900">{feature.title}</h3>
						<p class="text-sm leading-relaxed text-gray-500">{feature.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
