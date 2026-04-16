<script lang="ts">
	import { clsx } from 'clsx';
	import Button from '$lib/components/ui/Button.svelte';
	import { getDefaultWhatsAppUrl } from '$lib/utils/whatsapp.utils';
	import { siteConfig } from '$lib/config/site.config';
	import WhatsAppIcon from '$lib/components/icons/WhatsAppIcon.svelte';
</script>

<section class="section bg-linear-to-r from-green-500 to-green-600">
	<div class="container-app">
		<div class={clsx(
			'flex flex-col items-center gap-8 text-center text-white',
			'lg:flex-row lg:text-left',
		)}>
			<div class="lg:flex-1">
				<div class="mb-3 text-4xl">💬</div>
				<h2 class="font-display text-3xl font-bold sm:text-4xl">Fale conosco pelo WhatsApp!</h2>
				<p class="mt-4 text-lg text-green-100">
					Tire dúvidas, solicite orçamentos ou agende direto pelo WhatsApp. Respondemos em minutos!
				</p>
				<p class="mt-2 text-sm text-green-200">{siteConfig.openingHours}</p>
			</div>

			<div class="flex shrink-0 flex-col gap-4 sm:flex-row">
				<Button
					variant="whatsapp"
					size="xl"
					href={getDefaultWhatsAppUrl()}
					class="!bg-white !text-green-600 shadow-xl hover:!bg-green-50"
				>
					<WhatsAppIcon class="h-6 w-6" />
					Iniciar conversa
				</Button>

				<Button
					variant="outline"
					size="xl"
					href="/booking"
					class="!border-white !text-white hover:!bg-white/10"
				>
					Agendar online
				</Button>
			</div>
		</div>
	</div>
</section>
