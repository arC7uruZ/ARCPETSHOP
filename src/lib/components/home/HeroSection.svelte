<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { getDefaultWhatsAppUrl } from '$lib/utils/whatsapp.utils';
	import { siteConfig } from '$lib/config/site.config';
</script>

<section
	class="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50"
>
	<!-- Background decoration -->
	<div class="absolute inset-0 overflow-hidden" aria-hidden="true">
		<div
			class="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-100/50 blur-3xl"
		></div>
		<div
			class="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary-100/50 blur-3xl"
		></div>
		<div class="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-accent-100/30 blur-2xl">
		</div>
	</div>

	<div class="container-app relative z-10 py-24 lg:py-32">
		<div class="grid items-center gap-12 lg:grid-cols-2">
			<!-- Content -->
			<div class="animate-fade-in">
				<div
					class="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-700"
				>
					<span>🐾</span>
					<span>Cuidado premium para seu pet</span>
				</div>

				<h1 class="mb-6 font-display text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
					Seu pet merece
					<span
						class="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
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
					<Button
						variant="primary"
						size="xl"
						href="/booking"
						class="group"
					>
						<svg
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
						</svg>
						Agendar agora
					</Button>

					<Button
						variant="whatsapp"
						size="xl"
						href={getDefaultWhatsAppUrl()}
					>
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
							/>
						</svg>
						Falar no WhatsApp
					</Button>
				</div>

				<!-- Stats -->
				<div class="mt-12 grid grid-cols-3 gap-6 border-t border-gray-200 pt-8">
					{#each [{ value: '2.000+', label: 'Pets atendidos' }, { value: '98%', label: 'Satisfação' }, { value: '5 anos', label: 'De experiência' }] as stat}
						<div class="text-center">
							<div class="font-display text-2xl font-bold text-primary-600">{stat.value}</div>
							<div class="mt-1 text-xs text-gray-500">{stat.label}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Illustration -->
			<div class="flex justify-center animate-slide-up">
				<div class="relative">
					<!-- Main image placeholder with gradient -->
					<div
						class="h-80 w-80 rounded-3xl bg-gradient-to-br from-primary-400 to-secondary-400 shadow-2xl sm:h-96 sm:w-96 flex items-center justify-center"
					>
						<div class="text-center text-white">
							<div class="mb-4 text-8xl">🐕</div>
							<p class="text-xl font-bold font-display">Felizes & Saudáveis</p>
						</div>
					</div>

					<!-- Floating badges -->
					<div
						class="absolute -top-4 -left-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg"
					>
						<span class="text-2xl">⭐</span>
						<div>
							<div class="text-xs text-gray-500">Avaliação</div>
							<div class="font-bold text-gray-900">4.9/5</div>
						</div>
					</div>

					<div
						class="absolute -bottom-4 -right-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg"
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
