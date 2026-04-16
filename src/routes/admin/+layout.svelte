<script lang="ts">
	import { clsx } from 'clsx';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';

	interface Props {
		data: LayoutData;
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	const navItems = [
		{
			href: '/admin',
			label: 'Dashboard',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`
		},
		{
			href: '/admin/appointments',
			label: 'Agendamentos',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />`
		},
		{
			href: '/admin/caretakers',
			label: 'Cuidadores',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />`
		},
		...(data.userRole === 'root_admin'
			? [
					{
						href: '/admin/users',
						label: 'Usuários',
						icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />`
					}
				]
			: [])
	];

	let sidebarOpen = $state(false);

	function isActive(href: string) {
		if (href === '/admin') return page.url.pathname === '/admin';
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="flex min-h-screen bg-gray-50">
	<!-- Sidebar desktop -->
	<aside class="hidden w-64 flex-col bg-gray-900 lg:flex">
		<div class="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
				<svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
			</div>
			<span class="text-sm font-semibold text-white">Painel Admin</span>
		</div>

		<nav class="flex-1 space-y-1 px-4 py-6">
			{#each navItems as item}
				<a
					href={item.href}
					class={clsx(
						'flex items-center gap-3',
						'rounded-lg px-3 py-2.5 text-sm font-medium',
						'transition-colors',
						isActive(item.href)
							? 'bg-primary-600 text-white'
							: 'text-gray-400 hover:bg-gray-800 hover:text-white',
					)}
				>
					<svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						{@html item.icon}
					</svg>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="border-t border-gray-800 p-4">
			<div class="mb-3 flex items-center gap-3">
				<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
					{data.adminName.charAt(0).toUpperCase()}
				</div>
				<div class="min-w-0">
					<p class="truncate text-sm font-medium text-white">{data.adminName}</p>
					<p class="text-xs text-gray-400 capitalize">{data.userRole === 'root_admin' ? 'Super Admin' : 'Administrador'}</p>
				</div>
			</div>
			<a
				href="/dashboard"
				class="flex items-center gap-2 text-xs text-gray-400 transition-colors hover:text-white"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Voltar ao site
			</a>
		</div>
	</aside>

	<!-- Mobile sidebar overlay -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-40 bg-black/60 lg:hidden"
			role="button"
			tabindex="0"
			onclick={() => (sidebarOpen = false)}
			onkeydown={(e) => e.key === 'Escape' && (sidebarOpen = false)}
		></div>
		<aside class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 lg:hidden">
			<div class="flex h-16 items-center justify-between border-b border-gray-800 px-6">
				<span class="text-sm font-semibold text-white">Painel Admin</span>
				<button onclick={() => (sidebarOpen = false)} class="text-gray-400 hover:text-white">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<nav class="flex-1 space-y-1 px-4 py-6">
				{#each navItems as item}
					<a
						href={item.href}
						onclick={() => (sidebarOpen = false)}
						class={clsx(
							'flex items-center gap-3',
							'rounded-lg px-3 py-2.5 text-sm font-medium',
							'transition-colors',
							isActive(item.href)
								? 'bg-primary-600 text-white'
								: 'text-gray-400 hover:bg-gray-800 hover:text-white',
						)}
					>
						<svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							{@html item.icon}
						</svg>
						{item.label}
					</a>
				{/each}
			</nav>
		</aside>
	{/if}

	<!-- Main content -->
	<div class="flex min-w-0 flex-1 flex-col">
		<!-- Top bar mobile -->
		<header class="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:hidden lg:px-6">
			<button
				onclick={() => (sidebarOpen = true)}
				class="text-gray-500 hover:text-gray-700"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
			<span class="font-semibold text-gray-800">Painel Admin</span>
		</header>

		<main class="flex-1 p-4 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
