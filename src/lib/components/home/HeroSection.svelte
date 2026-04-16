<script lang="ts">
	import { clsx } from 'clsx';
	import Button from '$lib/components/ui/Button.svelte';
	import { getDefaultWhatsAppUrl } from '$lib/utils/whatsapp.utils';
	import { Calendar } from 'lucide-svelte';
	import WhatsAppIcon from '$lib/components/icons/WhatsAppIcon.svelte';

	const stats = [
		{ value: '2.000+', label: 'Pets atendidos' },
		{ value: '98%', label: 'Satisfação' },
		{ value: '5 anos', label: 'De experiência' }
	];
</script>

<section
	class={clsx(
		'relative flex min-h-screen items-center overflow-hidden',
		'from-primary-50 to-secondary-50 bg-linear-to-br via-white'
	)}
>
	<!-- Background decoration -->
	<div class="absolute inset-0 overflow-hidden" aria-hidden="true">
		<div class="bg-primary-100/50 absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl"></div>
		<div
			class="bg-secondary-100/50 absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl"
		></div>
		<div class="bg-accent-100/30 absolute top-1/3 left-1/4 h-64 w-64 rounded-full blur-2xl"></div>
	</div>

	<div class="container-app relative z-10 py-24 lg:py-32">
		<div class="grid items-center gap-12 lg:grid-cols-2">
			<!-- Content -->
			<div class="animate-fade-in">
				<div
					class={clsx(
						'mb-4 inline-flex items-center gap-2',
						'bg-primary-100 rounded-full px-4 py-1.5',
						'text-primary-700 text-sm font-semibold'
					)}
				>
					<span>🐾</span>
					<span>Cuidado premium para seu pet</span>
				</div>

				<h1
					class={clsx(
						'font-display mb-6',
						'text-4xl leading-tight font-extrabold text-gray-900',
						'sm:text-5xl lg:text-6xl'
					)}
				>
					Seu pet merece
					<span
						class="from-primary-500 to-secondary-500 bg-linear-to-r bg-clip-text text-transparent"
					>
						o melhor
					</span>
					cuidado
				</h1>

				<p class="mb-8 text-lg leading-relaxed text-gray-600 sm:text-xl">
					Oferecemos serviços completos de pet shop com profissionais apaixonados. Banho, tosa,
					consultas veterinárias, adestramento e muito mais — tudo em um só lugar.
				</p>

				<div class="flex flex-col gap-4 sm:flex-row">
					<Button variant="primary" size="xl" href="/booking" class="group">
						<Calendar class="h-5 w-5" />
						Agendar agora
					</Button>

					<Button variant="whatsapp" size="xl" href={getDefaultWhatsAppUrl()}>
						<WhatsAppIcon class="h-5 w-5" />
						Falar no WhatsApp
					</Button>
				</div>

				<!-- Stats -->
				<div class="mt-12 grid grid-cols-3 gap-6 border-t border-gray-200 pt-8">
					{#each stats as stat}
						<div class="text-center">
							<div class="font-display text-primary-600 text-2xl font-bold">{stat.value}</div>
							<div class="mt-1 text-xs text-gray-500">{stat.label}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Illustration -->
			<div class="animate-slide-up flex justify-center">
				<div class="relative">
					<!-- Main image placeholder with gradient -->
					<div
						class={clsx(
							'flex items-center justify-center',
							'h-80 w-80 sm:h-96 sm:w-96',
							'from-primary-400 to-secondary-400 rounded-3xl bg-linear-to-br',
							'shadow-2xl'
						)}
					>
						<div class="text-center text-white">
							<div class="mb-4 text-8xl">🐕</div>
							<p class="font-display text-xl font-bold">Felizes & Saudáveis</p>
						</div>
					</div>

					<!-- Floating badges -->
					<div
						class={clsx(
							'absolute -top-4 -left-4 flex items-center gap-2 rounded-2xl',
							'bg-white px-4 py-3 shadow-lg'
						)}
					>
						<span class="text-2xl">⭐</span>
						<div>
							<div class="text-xs text-gray-500">Avaliação</div>
							<div class="font-bold text-gray-900">4.9/5</div>
						</div>
					</div>

					<div
						class={clsx(
							'absolute -right-4 -bottom-4 flex items-center gap-2',
							'rounded-2xl bg-white px-4 py-3 shadow-lg'
						)}
					>
						<span class="text-2xl">🏆</span>
						<div>
							<div class="text-xs text-gray-500">Prêmio</div>
							<div class="font-bold text-gray-900">Top PetShop 2024</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
