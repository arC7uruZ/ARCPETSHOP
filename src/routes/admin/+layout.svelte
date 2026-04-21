<script lang="ts">
	import { clsx } from "clsx";
	import type { LayoutData } from "./$types";
	import { page } from "$app/state";
	import {
		Home,
		Calendar,
		Users,
		ShieldCheck,
		X,
		Menu,
		ArrowLeft,
		CircleUserRound,
		KeyRound
	} from "lucide-svelte";
	import { hasPermission } from "$lib/utils/permissions";

	interface Props {
		data: LayoutData;
		children: import("svelte").Snippet;
	}

	let { data, children }: Props = $props();

	const can = (permission: string) =>
		hasPermission(data.userRole, data.permissions, permission);

	const isCaretaker = $derived(data.userRole === "caretaker");
	const isRootAdmin = $derived(data.userRole === "root_admin");

	const navItems = $derived([
		can("dashboard:read") && { href: "/admin", label: "Dashboard", icon: Home },
		// Caretakers veem "Meus Agendamentos"; admins veem todos
		(can("appointments:read") || can("appointments:read:all")) && {
			href: "/admin/appointments",
			label: isCaretaker ? "Meus Agendamentos" : "Agendamentos",
			icon: Calendar
		},
		can("caretakers:read") && {
			href: "/admin/caretakers",
			label: "Cuidadores",
			icon: Users
		},
		can("users:read") && {
			href: "/admin/users",
			label: "Usuários",
			icon: CircleUserRound
		},
		isRootAdmin && {
			href: "/admin/roles",
			label: "Roles & Permissões",
			icon: KeyRound
		}
	].filter(Boolean) as { href: string; label: string; icon: typeof Home }[]);

	const panelTitle = $derived(isCaretaker ? "Área do Cuidador" : "Painel Admin");
	const roleLabel = $derived(
		data.userRole === "root_admin"
			? "Super Admin"
			: data.userRole === "admin"
				? "Administrador"
				: "Cuidador"
	);

	let sidebarOpen = $state(false);

	function isActive(href: string) {
		if (href === "/admin") return page.url.pathname === "/admin";
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="flex min-h-screen bg-gray-50">
	<!-- Sidebar desktop -->
	<aside class="hidden w-64 flex-col bg-gray-900 lg:flex">
		<div class="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
			<div
				class="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-lg"
			>
				<ShieldCheck class="h-4 w-4 text-white" />
			</div>
			<span class="text-sm font-semibold text-white">{panelTitle}</span>
		</div>

		<nav class="flex-1 space-y-1 px-4 py-6">
			{#each navItems as item}
				<a
					href={item.href}
					class={[
						"flex items-center gap-3",
						"rounded-lg px-3 py-2.5 text-sm font-medium",
						"transition-colors",
						isActive(item.href)
							? "bg-primary-600 text-white"
							: "text-gray-400 hover:bg-gray-800 hover:text-white"
					]}
				>
					<item.icon class="h-5 w-5 shrink-0" />
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="border-t border-gray-800 p-4">
			<div class="mb-3 flex items-center gap-3">
				<div
					class="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
				>
					{data.adminName.charAt(0).toUpperCase()}
				</div>
				<div class="min-w-0">
					<p class="truncate text-sm font-medium text-white">
						{data.adminName}
					</p>
					<p class="text-xs text-gray-400 capitalize">{roleLabel}</p>
				</div>
			</div>
			<a
				href="/dashboard"
				class="flex items-center gap-2 text-xs text-gray-400 transition-colors hover:text-white"
			>
				<ArrowLeft class="h-4 w-4" />
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
			onkeydown={(e) => e.key === "Escape" && (sidebarOpen = false)}
		></div>
		<aside
			class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 lg:hidden"
		>
			<div
				class="flex h-16 items-center justify-between border-b border-gray-800 px-6"
			>
				<span class="text-sm font-semibold text-white">{panelTitle}</span>
				<button
					onclick={() => (sidebarOpen = false)}
					class="text-gray-400 hover:text-white"
				>
					<X class="h-5 w-5" />
				</button>
			</div>
			<nav class="flex-1 space-y-1 px-4 py-6">
				{#each navItems as item}
					<a
						href={item.href}
						onclick={() => (sidebarOpen = false)}
						class={clsx(
							"flex items-center gap-3",
							"rounded-lg px-3 py-2.5 text-sm font-medium",
							"transition-colors",
							isActive(item.href)
								? "bg-primary-600 text-white"
								: "text-gray-400 hover:bg-gray-800 hover:text-white"
						)}
					>
						<item.icon class="h-5 w-5 shrink-0" />
						{item.label}
					</a>
				{/each}
			</nav>
		</aside>
	{/if}

	<!-- Main content -->
	<div class="flex min-w-0 flex-1 flex-col">
		<!-- Top bar mobile -->
		<header
			class="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:hidden lg:px-6"
		>
			<button
				onclick={() => (sidebarOpen = true)}
				class="text-gray-500 hover:text-gray-700"
			>
				<Menu class="h-6 w-6" />
			</button>
			<span class="font-semibold text-gray-800">{panelTitle}</span>
		</header>

		<main class="flex-1 p-4 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
