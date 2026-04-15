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

<div class="from-primary-500 to-primary-600 bg-linear-to-r pt-32 pb-20">
	<div class="container-app text-center text-white">
		<h1 class="font-display text-4xl font-bold">Agendar Serviço</h1>
		<p class="text-primary-100 mt-3">Siga os passos para agendar o serviço do seu pet.</p>
	</div>
</div>

<div class="container-app -mt-10 pb-20">
	<BookingWizard services={data.services} pets={data.pets} caretakers={data.caretakers} {form} />
</div>
