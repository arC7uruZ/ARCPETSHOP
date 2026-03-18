<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
</script>

<div class="py-12 text-center">
	<div class="mb-6 text-7xl animate-bounce-soft">🎉</div>
	<h2 class="mb-3 font-display text-2xl font-bold text-gray-900">Agendamento confirmado!</h2>
	<p class="mb-2 text-gray-600">
		Seu agendamento foi realizado com sucesso. Você receberá uma confirmação no WhatsApp.
	</p>
	<p class="mb-8 text-sm text-gray-500">
		Caso precise cancelar ou reagendar, acesse sua conta ou entre em contato conosco.
	</p>

	<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
		<Button variant="primary" size="lg" href="/dashboard">Ver meus agendamentos</Button>
		<Button variant="outline" size="lg" href="/">Voltar ao início</Button>
	</div>
</div>
