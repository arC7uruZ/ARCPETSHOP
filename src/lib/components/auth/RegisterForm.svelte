<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	interface Props {
		form?: { error?: string; errors?: Record<string, string> } | null;
	}

	let { form }: Props = $props();

	let fullName = $state('');
	let email = $state('');
	let phone = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
</script>

<form
	method="POST"
	action="?/register"
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
		name="full_name"
		label="Nome completo"
		placeholder="João da Silva"
		bind:value={fullName}
		error={form?.errors?.full_name}
		required
	/>

	<Input
		name="email"
		type="email"
		label="E-mail"
		placeholder="seu@email.com"
		bind:value={email}
		error={form?.errors?.email}
		required
	/>

	<Input
		name="phone"
		type="tel"
		label="WhatsApp"
		placeholder="(11) 99999-9999"
		bind:value={phone}
		error={form?.errors?.phone}
	/>

	<Input
		name="password"
		type="password"
		label="Senha"
		placeholder="Mínimo 6 caracteres"
		bind:value={password}
		error={form?.errors?.password}
		required
	/>

	<Input
		name="confirmPassword"
		type="password"
		label="Confirmar senha"
		placeholder="Repita a senha"
		bind:value={confirmPassword}
		error={form?.errors?.confirmPassword}
		required
	/>

	<Button type="submit" variant="primary" size="lg" fullWidth {loading}>
		{loading ? 'Criando conta...' : 'Criar conta'}
	</Button>

	<p class="text-center text-sm text-gray-500">
		Já tem uma conta?
		<a href="/auth/login" class="font-semibold text-primary-600 hover:underline">Entrar</a>
	</p>
</form>
