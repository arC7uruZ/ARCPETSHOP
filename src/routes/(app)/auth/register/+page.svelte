<script lang="ts">
	import type { ActionData } from './$types';
	import { page } from '$app/state';
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	const success = $derived(page.url.searchParams.get('success') === '1');
</script>

<svelte:head>
	<title>Cadastrar — ArcPetShop</title>
</svelte:head>

{#if success}
	<div class="text-center">
		<div class="mb-4 text-5xl">📬</div>
		<h1 class="font-display text-2xl font-bold text-gray-900">Confirme seu e-mail</h1>
		<p class="mt-3 text-sm text-gray-500">
			Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar sua conta e acessar
			o site.
		</p>
		<p class="mt-4 text-xs text-gray-400">Não recebeu? Verifique a pasta de spam.</p>
		<a
			href="/auth/login"
			class="text-primary-600 mt-6 inline-block text-sm font-semibold hover:underline"
		>
			Já confirmei → Entrar
		</a>
	</div>
{:else}
	<div class="mb-6 text-center">
		<h1 class="font-display text-2xl font-bold text-gray-900">Crie sua conta</h1>
		<p class="mt-1 text-sm text-gray-500">
			Cadastre-se para agendar serviços e gerenciar seus pets.
		</p>
	</div>
	<RegisterForm {form} />
{/if}
