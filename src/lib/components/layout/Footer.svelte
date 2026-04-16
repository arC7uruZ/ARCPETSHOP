<script lang="ts">
	import { clsx } from 'clsx';
	import { siteConfig } from '$lib/config/site.config';
	import { getDefaultWhatsAppUrl } from '$lib/utils/whatsapp.utils';
	import InstagramIcon from '$lib/components/icons/InstagramIcon.svelte';
	import FacebookIcon from '$lib/components/icons/FacebookIcon.svelte';
	import WhatsAppIcon from '$lib/components/icons/WhatsAppIcon.svelte';

	const year = new Date().getFullYear();

	const socialLinkBase = clsx(
		'flex h-9 w-9 items-center justify-center',
		'rounded-lg bg-gray-800',
		'text-gray-400 transition-colors'
	);

	const services = [
		'Banho e Tosa',
		'Consulta Veterinária',
		'Vacinação',
		'Hospedagem Pet',
		'Adestramento',
		'Pet Taxi'
	];
</script>

<footer class="bg-gray-900 text-gray-300">
	<div class="container-app py-12">
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Brand -->
			<div class="lg:col-span-2">
				<div class="font-display mb-4 flex items-center gap-2 text-xl font-bold text-white">
					<span class="text-2xl">🐾</span>
					<span>{siteConfig.name}</span>
				</div>
				<p class="mb-4 text-sm leading-relaxed text-gray-400">{siteConfig.description}</p>
				<div class="flex gap-3">
					<a
						href={siteConfig.socialLinks.instagram}
						target="_blank"
						rel="noopener noreferrer"
						class={clsx(socialLinkBase, 'hover:bg-primary-500 hover:text-white')}
						aria-label="Instagram"
					>
						<InstagramIcon class="h-4 w-4" />
					</a>
					<a
						href={siteConfig.socialLinks.facebook}
						target="_blank"
						rel="noopener noreferrer"
						class={clsx(socialLinkBase, 'hover:bg-primary-500 hover:text-white')}
						aria-label="Facebook"
					>
						<FacebookIcon class="h-4 w-4" />
					</a>
					<a
						href={getDefaultWhatsAppUrl()}
						target="_blank"
						rel="noopener noreferrer"
						class={clsx(socialLinkBase, 'hover:bg-green-500 hover:text-white')}
						aria-label="WhatsApp"
					>
						<WhatsAppIcon class="h-4 w-4" />
					</a>
				</div>
			</div>

			<!-- Services -->
			<div>
				<h3 class="mb-4 text-sm font-semibold tracking-wider text-white uppercase">Serviços</h3>
				<ul class="space-y-2 text-sm">
					{#each services as service}
						<li>
							<a href="/services" class="text-gray-400 transition-colors hover:text-white"
								>{service}</a
							>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Contact -->
			<div>
				<h3 class="mb-4 text-sm font-semibold tracking-wider text-white uppercase">Contato</h3>
				<ul class="space-y-2 text-sm text-gray-400">
					<li>📍 {siteConfig.address.street}, {siteConfig.address.neighborhood}</li>
					<li>{siteConfig.address.city} - {siteConfig.address.state}</li>
					<li>📞 {siteConfig.phone}</li>
					<li>✉️ {siteConfig.email}</li>
					<li class="mt-3 text-xs leading-relaxed">{siteConfig.openingHours}</li>
				</ul>
			</div>
		</div>

		<div class="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
			<p>© {year} {siteConfig.name}. Todos os direitos reservados.</p>
		</div>
	</div>
</footer>
