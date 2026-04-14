<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { navigating } from '$app/state';
	import NProgress from 'nprogress';
	import 'nprogress/nprogress.css';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.store.svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import ToastContainer from '$lib/components/ui/ToastContainer.svelte';

	interface Props {
		data: {
			session: import('@supabase/supabase-js').Session | null;
			user: import('@supabase/supabase-js').User | null;
			supabase: import('@supabase/supabase-js').SupabaseClient;
		};
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	// Sincroniza a sessão validada pelo servidor com o authStore
	$effect(() => {
		authStore.setSession(data.session);
	});

	NProgress.configure({ showSpinner: false });

	$effect(() => {
		if (navigating.to) {
			NProgress.start();
		} else {
			NProgress.done();
		}
	});

	onMount(() => {
		const {
			data: { subscription }
		} = data.supabase.auth.onAuthStateChange((event, session) => {
			// Atualiza o store e invalida o cache de navegação para re-executar os loads
			authStore.setSession(session);
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>ArcPetShop — Cuidado e amor para o seu pet</title>
	<meta
		name="description"
		content="Serviços completos de pet shop: banho, tosa, consulta veterinária, vacinação, hospedagem, adestramento e pet taxi."
	/>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Navbar />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>

<ToastContainer />

<style>
	#nprogress .bar {
		background: #f5c842;
		height: 2px;
	}
</style>
