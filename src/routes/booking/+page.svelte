<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import BookingWizard from '$lib/components/booking/BookingWizard.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Agendar serviço — ArcPetShop</title>
</svelte:head>

<div class="bg-gradient-to-r from-primary-500 to-primary-600 pb-20 pt-32">
	<div class="container-app text-center text-white">
		<h1 class="font-display text-4xl font-bold">Agendar Serviço</h1>
		<p class="mt-3 text-primary-100">Siga os passos para agendar o serviço do seu pet.</p>
	</div>
</div>

<div class="container-app -mt-10 pb-20">
	<BookingWizard services={data.services} pets={data.pets} {form} />
</div>
