<script lang="ts">
	import type { ActionData } from './$types';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
</script>

<svelte:head>
	<title>Entrar — ArcPetShop</title>
</svelte:head>

<div class="mb-6 text-center">
	<h1 class="font-display text-2xl font-bold text-gray-900">Bem-vindo de volta!</h1>
	<p class="mt-1 text-sm text-gray-500">Entre na sua conta para gerenciar seus agendamentos.</p>
</div>

<LoginForm {form} />
