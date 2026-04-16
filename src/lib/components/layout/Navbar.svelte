<script lang="ts">
	import { clsx } from 'clsx';
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/auth.store.svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';
	import { siteConfig } from '$lib/config/site.config';
	import Button from '$lib/components/ui/Button.svelte';
	import { X, Menu } from 'lucide-svelte';

	const navLinks = [
		{ href: '/', label: 'Início' },
		{ href: '/services', label: 'Serviços' },
		{ href: '/store', label: 'Loja' },
		{ href: '/about', label: 'Quem Somos' }
	];

	let scrolled = $state(false);

	// Na home a navbar começa transparente e fica sólida ao rolar.
	// Em qualquer outra página fica sempre sólida (o header das páginas tem cor própria).
	const isHome = $derived(page.url.pathname === '/');

	$effect(() => {
		const handler = () => {
			scrolled = window.scrollY > 20;
		};
		window.addEventListener('scroll', handler, { passive: true });
		return () => window.removeEventListener('scroll', handler);
	});
</script>

<header
	class={clsx(
		'fixed top-0 right-0 left-0 z-40',
		'transition-all duration-300',
		!isHome || scrolled ? 'bg-white/95 shadow-sm backdrop-blur-md' : 'bg-transparent'
	)}
>
	<nav class="container-app flex h-16 items-center justify-between">
		<!-- Logo -->
		<a href="/" class="font-display flex items-center gap-2 text-xl font-bold">
			<span class="text-2xl">🐾</span>
			<span class="text-primary-600">{siteConfig.name}</span>
		</a>

		<!-- Desktop nav -->
		<div class="hidden items-center gap-8 md:flex">
			{#each navLinks as link}
				<a
					href={link.href}
					class={clsx(
						'text-sm font-medium transition-colors',
						page.url.pathname === link.href
							? 'text-primary-600'
							: 'hover:text-primary-600 text-gray-700'
					)}
				>
					{link.label}
				</a>
			{/each}
		</div>

		<!-- Auth actions -->
		<div class="hidden items-center gap-3 md:flex">
			{#if authStore.isAuthenticated}
				<a
					href="/dashboard"
					class="hover:text-primary-600 text-sm font-medium text-gray-700 transition-colors"
				>
					Minha Conta
				</a>
				<Button variant="outline" size="sm" href="/booking">Agendar</Button>
			{:else}
				<Button variant="ghost" size="sm" href="/login">Entrar</Button>
				<Button variant="primary" size="sm" href="/register">Cadastrar</Button>
			{/if}
		</div>

		<!-- Mobile hamburger -->
		<button
			class="flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
			onclick={() => uiStore.toggleMobileMenu()}
			aria-label="Menu"
		>
			{#if uiStore.mobileMenuOpen}
				<X class="h-5 w-5" />
			{:else}
				<Menu class="h-5 w-5" />
			{/if}
		</button>
	</nav>

	<!-- Mobile menu -->
	{#if uiStore.mobileMenuOpen}
		<div class="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
			<div class="flex flex-col gap-3">
				{#each navLinks as link}
					<a
						href={link.href}
						class={clsx(
							'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
							page.url.pathname === link.href
								? 'bg-primary-50 text-primary-600'
								: 'text-gray-700 hover:bg-gray-50'
						)}
						onclick={() => uiStore.closeMobileMenu()}
					>
						{link.label}
					</a>
				{/each}
				<div class="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-2">
					{#if authStore.isAuthenticated}
						<a
							href="/dashboard"
							class="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
							onclick={() => uiStore.closeMobileMenu()}
						>
							Perfil
						</a>
					{:else}
						<Button variant="outline" size="sm" fullWidth href="/login">Entrar</Button>
						<Button variant="primary" size="sm" fullWidth href="/register">Cadastrar</Button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</header>
