<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { ActionResult } from '@sveltejs/kit';

	interface Props {
		form?: { error?: string } | null;
	}

	let { form }: Props = $props();

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
</script>

<form
	method="POST"
	action="?/login"
	use:enhance={() => {
		loading = true;
		return ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
			loading = false;
			update();
		};
	}}
	class="space-y-4"
>
	{#if form?.error}
		<div class="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
			{form.error}
		</div>
	{/if}

	<Input
		name="email"
		type="email"
		label="E-mail"
		placeholder="seu@email.com"
		bind:value={email}
		required
	/>

	<Input
		name="password"
		type="password"
		label="Senha"
		placeholder="••••••••"
		bind:value={password}
		required
	/>

	<div class="flex justify-end">
		<a href="/auth/forgot-password" class="text-xs text-primary-600 hover:underline">
			Esqueceu a senha?
		</a>
	</div>

	<Button type="submit" variant="primary" size="lg" fullWidth {loading}>
		{loading ? 'Entrando...' : 'Entrar'}
	</Button>

	<p class="text-center text-sm text-gray-500">
		Não tem uma conta?
		<a href="/auth/register" class="font-semibold text-primary-600 hover:underline">
			Cadastre-se
		</a>
	</p>
</form>
