<script lang="ts">
	const testimonials = [
		{
			name: 'Ana Lima',
			pet: 'Tutora do Bob (Golden Retriever)',
			text: 'Serviço incrível! O Bob adora vir aqui. A equipe é super carinhosa e ele sempre sai cheiroso e feliz. Recomendo muito!',
			rating: 5,
			avatar: '👩‍🦰'
		},
		{
			name: 'Carlos Silva',
			pet: 'Tutor da Luna (Poodle)',
			text: 'Encontrei o melhor pet shop da cidade. A consulta veterinária foi excelente, veterinário muito atencioso. A Luna ficou bem cuidada.',
			rating: 5,
			avatar: '👨'
		},
		{
			name: 'Mariana Santos',
			pet: 'Tutora do Thor (Labrador)',
			text: 'O serviço de hospedagem é maravilhoso! Viajei tranquila sabendo que meu Thor estava em ótimas mãos. Recebi fotos todos os dias!',
			rating: 5,
			avatar: '👩'
		},
		{
			name: 'Rafael Costa',
			pet: 'Tutor da Mel (SRD)',
			text: 'O adestramento mudou completamente o comportamento da Mel. Em apenas 4 sessões já vemos resultados incríveis. Profissional nota 10!',
			rating: 5,
			avatar: '👨‍💼'
		},
		{
			name: 'Júlia Ferreira',
			pet: 'Tutora do Simba (Persa)',
			text: 'Meu gato é muito estressado com veterinário, mas aqui ele ficou calmo. A abordagem é diferente, muito mais gentil. Nunca mais vou a outro lugar.',
			rating: 5,
			avatar: '👩‍🦱'
		},
		{
			name: 'Pedro Alves',
			pet: 'Tutor da Nina (Beagle)',
			text: 'Agendamento fácil pelo WhatsApp, pontualidade impecável e resultado perfeito no banho e tosa. A Nina ficou linda! 10/10.',
			rating: 5,
			avatar: '🧑'
		}
	];
</script>

<section class="section from-primary-50 to-secondary-50 bg-gradient-to-br">
	<div class="container-app">
		<div class="text-center">
			<h2 class="section-title">O que dizem nossos clientes</h2>
			<p class="section-subtitle mx-auto max-w-2xl">
				Mais de 2.000 tutores satisfeitos. Veja o que eles falam sobre a gente.
			</p>
		</div>

		<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each testimonials as t}
				<div class="rounded-2xl bg-white p-6 shadow-md">
					<!-- Stars -->
					<div class="mb-3 flex gap-0.5">
						{#each { length: t.rating } as _}
							<span class="text-yellow-400">★</span>
						{/each}
					</div>

					<p class="mb-4 text-sm leading-relaxed text-gray-600">"{t.text}"</p>

					<div class="flex items-center gap-3">
						<div
							class="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-full text-xl"
						>
							{t.avatar}
						</div>
						<div>
							<div class="text-sm font-semibold text-gray-900">{t.name}</div>
							<div class="text-xs text-gray-500">{t.pet}</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
