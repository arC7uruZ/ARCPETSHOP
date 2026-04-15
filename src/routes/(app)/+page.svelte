<script lang="ts">
	import type { PageData } from './$types';
	import HeroSection from '$lib/components/home/HeroSection.svelte';
	import ServicesPreview from '$lib/components/home/ServicesPreview.svelte';
	import FeaturesSection from '$lib/components/home/FeaturesSection.svelte';
	import TestimonialsSection from '$lib/components/home/TestimonialsSection.svelte';
	import WhatsAppCTA from '$lib/components/home/WhatsAppCTA.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>ArcPetShop — Cuidado premium para o seu pet</title>
</svelte:head>

<HeroSection />
<FeaturesSection />
<ServicesPreview services={data.services} />
<TestimonialsSection />
<WhatsAppCTA />
