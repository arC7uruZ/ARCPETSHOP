<script lang="ts">
	import { onMount } from "svelte";
	import { clsx } from "clsx";
	import type { PageData } from "./$types";
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { siteConfig } from "$lib/config/site.config";
	import {
		CheckCircle2,
		Clock,
		XCircle,
		Package,
		QrCode,
		Receipt,
		ChevronLeft,
		Copy
	} from "lucide-svelte";
	import JsBarcode from "jsbarcode";
	import { uiStore } from "$lib/stores/ui.store.svelte";

	// data.supabase vem do +layout.ts (dados de layout são mesclados com os da página)
	interface Props {
		data: PageData & { supabase: SupabaseClient };
	}

	let { data }: Props = $props();

	const order = $derived(data.order);
	const payment = $derived(order.payment);

	let realtimeStatus = $state<string | null>(null);

	const mpStatus = $derived(
		realtimeStatus ?? payment?.mp_status ?? order.mp_status ?? ""
	);

	onMount(() => {
		const initialStatus = payment?.mp_status ?? order.mp_status ?? "";
		const isPendingPix =
			(initialStatus === "pending" || initialStatus === "action_required") &&
			payment?.mp_payment_method === "pix";

		if (!isPendingPix) return;

		const channel = data.supabase
			.channel(`payment-${order.id}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "payments",
					filter: `order_id=eq.${order.id}`
				},
				(payload: { new: Record<string, unknown> }) => {
					const newStatus = payload.new.mp_status as string | undefined;
					if (newStatus && newStatus !== mpStatus) {
						realtimeStatus = newStatus;
						if (newStatus === "approved" || newStatus === "processed") {
							uiStore.success(
								"Pagamento recebido! Seu pedido está confirmado."
							);
						}
					}
				}
			)
			.subscribe();

		return () => {
			data.supabase.removeChannel(channel);
		};
	});

	const statusInfo = $derived(
		(): {
			icon: typeof CheckCircle2;
			color: string;
			bg: string;
			border: string;
			title: string;
			desc: string;
		} => {
			switch (mpStatus) {
				case "approved":
					return {
						icon: CheckCircle2,
						color: "text-green-500",
						bg: "bg-green-50",
						border: "border-green-100",
						title: "Pagamento aprovado!",
						desc: "Seu pedido foi confirmado e está sendo preparado."
					};
				case "pending":
				case "in_process":
				case "action_required":
					return {
						icon: Clock,
						color: "text-amber-500",
						bg: "bg-amber-50",
						border: "border-amber-100",
						title: "Aguardando pagamento",
						desc:
							payment?.mp_payment_method === "pix"
								? "Use o QR Code ou o código Pix abaixo para realizar o pagamento."
								: "Seu pagamento está sendo processado."
					};
				case "rejected":
					return {
						icon: XCircle,
						color: "text-red-500",
						bg: "bg-red-50",
						border: "border-red-100",
						title: "Pagamento recusado",
						desc: "Não foi possível processar o pagamento. Tente novamente com outro método."
					};
				default:
					return {
						icon: Package,
						color: "text-gray-400",
						bg: "bg-gray-50",
						border: "border-gray-100",
						title: "Pedido recebido",
						desc: "Seu pedido foi registrado."
					};
			}
		}
	);

	function formatPrice(v: number) {
		return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
	}

	function formatDate(d: string) {
		return new Date(d).toLocaleString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	}

	async function copyPixCode() {
		if (!payment?.pix_qr_code) return;
		try {
			await navigator.clipboard.writeText(payment.pix_qr_code);
			uiStore.success("Código Pix copiado!");
		} catch {
			uiStore.error("Não foi possível copiar o código.");
		}
	}

	async function copyBoletoCode() {
		if (!payment?.boleto_barcode) return;
		try {
			await navigator.clipboard.writeText(payment.boleto_barcode);
			uiStore.success("Código de barras copiado!");
		} catch {
			uiStore.error("Não foi possível copiar o código.");
		}
	}

	let boletoSvg = $state<SVGSVGElement | null>(null);

	$effect(() => {
		if (boletoSvg && payment?.boleto_barcode) {
			try {
				JsBarcode(boletoSvg, payment.boleto_barcode, {
					format: "ITF",
					displayValue: false,
					margin: 10,
					width: 2,
					height: 80
				});
			} catch {
				// barcode content inválido — oculta o SVG
				boletoSvg.style.display = "none";
			}
		}
	});

	const shortId = $derived(order.id.slice(0, 8).toUpperCase());
</script>

<svelte:head>
	<title>Pedido #{shortId} — {siteConfig.name}</title>
</svelte:head>

<div class="from-primary-500 to-secondary-500 bg-linear-to-br pt-32 pb-10">
	<div class="container-app text-center text-white">
		<h1 class="font-display text-3xl font-bold">Pedido #{shortId}</h1>
		<p class="mt-2 text-sm text-white/80">{formatDate(order.created_at)}</p>
	</div>
</div>

<section class="section bg-gray-50">
	<div class="container-app max-w-2xl">
		<a
			href="/store"
			class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
		>
			<ChevronLeft class="h-4 w-4" />
			Voltar à loja
		</a>

		<!-- Status Card -->
		{#each [statusInfo()] as si}
			<div
				class={clsx(
					"mb-6 rounded-2xl border p-6 text-center",
					si.bg,
					si.border
				)}
			>
				<div class="mb-3 flex justify-center">
					<si.icon class={clsx("h-12 w-12", si.color)} />
				</div>
				<h2 class="text-xl font-bold text-gray-900">{si.title}</h2>
				<p class="mt-1 text-sm text-gray-600">{si.desc}</p>
			</div>
		{/each}

		<!-- Pix QR Code -->
		{#if payment?.mp_payment_method === "pix"}
			{#if mpStatus === "approved" || mpStatus === "processed"}
				<div
					class="mb-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-center shadow-sm"
				>
					<CheckCircle2 class="mx-auto mb-3 h-12 w-12 text-green-500" />
					<h3 class="text-lg font-bold text-green-800">
						Pagamento Pix recebido!
					</h3>
					<p class="mt-1 text-sm text-green-700">
						Seu pedido foi confirmado e está sendo preparado.
					</p>
				</div>
			{:else if mpStatus === "pending" || mpStatus === "action_required"}
				<div
					class="mb-6 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
				>
					<div class="mb-4 flex items-center justify-center gap-2">
						<QrCode class="h-5 w-5 text-gray-600" />
						<h3 class="font-semibold text-gray-900">Pague com Pix</h3>
						<span
							class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
						>
							<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500"
							></span>
							Aguardando
						</span>
					</div>

					{#if payment.pix_qr_code_base64}
						<img
							src="data:image/png;base64,{payment.pix_qr_code_base64}"
							alt="QR Code Pix"
							class="mx-auto mb-4 h-48 w-48 rounded-xl"
						/>
					{/if}

					{#if payment.pix_qr_code}
						<div class="rounded-xl bg-gray-50 p-3 text-left">
							<p class="mb-2 text-xs font-medium text-gray-500">
								Pix Copia e Cola:
							</p>
							<p class="font-mono text-xs break-all text-gray-700 select-all">
								{payment.pix_qr_code}
							</p>
						</div>
						<button
							onclick={copyPixCode}
							class="mx-auto mt-3 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
						>
							<Copy class="h-4 w-4" />
							Copiar código Pix
						</button>
					{/if}

					<p class="mt-4 text-xs text-gray-400">
						A página atualiza automaticamente após o pagamento ser confirmado.
					</p>
				</div>
			{/if}
		{/if}

		<!-- Boleto -->
		{#if (mpStatus === "pending" || mpStatus === "action_required") && payment?.boleto_url}
			<div
				class="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
			>
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Receipt class="h-5 w-5 text-gray-600" />
						<h3 class="font-semibold text-gray-900">Boleto Bancário</h3>
					</div>
					<span
						class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
					>
						<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500"
						></span>
						Aguardando pagamento
					</span>
				</div>

				{#if payment.boleto_barcode}
					<!-- Barcode image -->
					<div
						class="mb-4 overflow-x-auto rounded-xl border border-gray-100 bg-white p-3"
					>
						<svg bind:this={boletoSvg} class="mx-auto block max-w-full"></svg>
					</div>

					<!-- Código copiável -->
					<div class="mb-4 rounded-xl bg-gray-50 p-3">
						<p class="mb-1.5 text-xs font-medium text-gray-500">
							Código de barras:
						</p>
						<p
							class="font-mono text-xs leading-relaxed break-all text-gray-700 select-all"
						>
							{payment.boleto_barcode}
						</p>
					</div>

					<!-- Ações -->
					<div class="flex flex-col gap-2 sm:flex-row">
						<button
							onclick={copyBoletoCode}
							class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
						>
							<Copy class="h-4 w-4" />
							Copiar código
						</button>
						<a
							href={payment.boleto_url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
						>
							<Receipt class="h-4 w-4" />
							Abrir boleto
						</a>
					</div>
				{:else}
					<a
						href={payment.boleto_url}
						target="_blank"
						rel="noopener noreferrer"
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
					>
						<Receipt class="h-4 w-4" />
						Abrir boleto
					</a>
				{/if}
			</div>
		{/if}

		<!-- Order Items -->
		<div class="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
			<h3 class="mb-4 font-semibold text-gray-900">Itens do pedido</h3>
			<ul class="space-y-3">
				{#each order.items as item (item.id)}
					<li class="flex justify-between gap-2">
						<div>
							<p class="text-sm font-medium text-gray-800">
								{item.product_name}
							</p>
							<p class="text-xs text-gray-400">
								{item.product_brand} · Qtd: {item.quantity}
							</p>
						</div>
						<span class="shrink-0 text-sm font-semibold text-gray-800">
							{formatPrice(item.subtotal)}
						</span>
					</li>
				{/each}
			</ul>

			<div class="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
				<div class="flex justify-between text-gray-500">
					<span>Subtotal</span>
					<span>{formatPrice(order.subtotal)}</span>
				</div>
				<div class="flex justify-between text-gray-500">
					<span>Frete</span>
					<span
						class={order.shipping === 0 ? "font-medium text-green-600" : ""}
					>
						{order.shipping === 0 ? "Grátis" : formatPrice(order.shipping)}
					</span>
				</div>
				<div
					class="flex justify-between border-t border-gray-100 pt-1.5 text-base font-bold text-gray-900"
				>
					<span>Total</span>
					<span>{formatPrice(order.total)}</span>
				</div>
			</div>
		</div>

		<!-- Shipping Address -->
		{#if order.shipping_address}
			<div
				class="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
			>
				<h3 class="mb-3 font-semibold text-gray-900">Endereço de entrega</h3>
				<address class="space-y-0.5 text-sm text-gray-600 not-italic">
					{#if order.shipping_name}<p class="font-medium text-gray-800">
							{order.shipping_name}
						</p>{/if}
					<p>{order.shipping_address}</p>
					<p>
						{[order.shipping_city, order.shipping_state, order.shipping_zip]
							.filter(Boolean)
							.join(", ")}
					</p>
				</address>
			</div>
		{/if}

		<!-- Actions -->
		{#if mpStatus === "rejected"}
			<a
				href="/checkout"
				class="bg-primary-500 hover:bg-primary-600 block w-full rounded-xl py-3 text-center text-sm font-semibold text-white transition-colors"
			>
				Tentar novamente
			</a>
		{:else}
			<a
				href="/store"
				class="block w-full rounded-xl border border-gray-200 bg-white py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
			>
				Continuar comprando
			</a>
		{/if}
	</div>
</section>
