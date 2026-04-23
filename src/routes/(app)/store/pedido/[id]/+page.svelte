<script lang="ts">
	import { clsx } from 'clsx';
	import type { PageData } from './$types';
	import { siteConfig } from '$lib/config/site.config';
	import {
		CheckCircle2,
		Clock,
		XCircle,
		Package,
		QrCode,
		Receipt,
		ChevronLeft,
		Copy
	} from 'lucide-svelte';
	import { uiStore } from '$lib/stores/ui.store.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const order = $derived(data.order);
	const payment = $derived(order.payment);

	const mpStatus = $derived(payment?.mp_status ?? order.mp_status ?? '');

	const statusInfo = $derived((): {
		icon: typeof CheckCircle2;
		color: string;
		bg: string;
		border: string;
		title: string;
		desc: string;
	} => {
		switch (mpStatus) {
			case 'approved':
				return {
					icon: CheckCircle2,
					color: 'text-green-500',
					bg: 'bg-green-50',
					border: 'border-green-100',
					title: 'Pagamento aprovado!',
					desc: 'Seu pedido foi confirmado e está sendo preparado.'
				};
			case 'pending':
			case 'in_process':
				return {
					icon: Clock,
					color: 'text-amber-500',
					bg: 'bg-amber-50',
					border: 'border-amber-100',
					title: 'Aguardando pagamento',
					desc:
						payment?.mp_payment_method === 'pix'
							? 'Use o QR Code ou o código Pix abaixo para realizar o pagamento.'
							: 'Seu pagamento está sendo processado.'
				};
			case 'rejected':
				return {
					icon: XCircle,
					color: 'text-red-500',
					bg: 'bg-red-50',
					border: 'border-red-100',
					title: 'Pagamento recusado',
					desc: 'Não foi possível processar o pagamento. Tente novamente com outro método.'
				};
			default:
				return {
					icon: Package,
					color: 'text-gray-400',
					bg: 'bg-gray-50',
					border: 'border-gray-100',
					title: 'Pedido recebido',
					desc: 'Seu pedido foi registrado.'
				};
		}
	});

	function formatPrice(v: number) {
		return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	function formatDate(d: string) {
		return new Date(d).toLocaleString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function copyPixCode() {
		if (!payment?.pix_qr_code) return;
		try {
			await navigator.clipboard.writeText(payment.pix_qr_code);
			uiStore.success('Código Pix copiado!');
		} catch {
			uiStore.error('Não foi possível copiar o código.');
		}
	}

	const shortId = $derived(order.id.slice(0, 8).toUpperCase());
</script>

<svelte:head>
	<title>Pedido #{shortId} — {siteConfig.name}</title>
</svelte:head>

<div class="from-primary-500 to-secondary-500 bg-linear-to-br pt-32 pb-10">
	<div class="container-app text-center text-white">
		<h1 class="font-display text-3xl font-bold">Pedido #{shortId}</h1>
		<p class="mt-2 text-white/80 text-sm">{formatDate(order.created_at)}</p>
	</div>
</div>

<section class="section bg-gray-50">
	<div class="container-app max-w-2xl">
		<a
			href="/store"
			class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
		>
			<ChevronLeft class="h-4 w-4" />
			Voltar à loja
		</a>

		<!-- Status Card -->
		{#each [statusInfo()] as si}
			<div
				class={clsx(
					'mb-6 rounded-2xl border p-6 text-center',
					si.bg,
					si.border
				)}
			>
				<div class="flex justify-center mb-3">
					<si.icon class={clsx('h-12 w-12', si.color)} />
				</div>
				<h2 class="text-xl font-bold text-gray-900">{si.title}</h2>
				<p class="mt-1 text-sm text-gray-600">{si.desc}</p>
			</div>
		{/each}

		<!-- Pix QR Code -->
		{#if mpStatus === 'pending' && payment?.mp_payment_method === 'pix'}
			<div class="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center">
				<div class="flex items-center justify-center gap-2 mb-4">
					<QrCode class="h-5 w-5 text-gray-600" />
					<h3 class="font-semibold text-gray-900">Pague com Pix</h3>
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
						<p class="mb-2 text-xs font-medium text-gray-500">Pix Copia e Cola:</p>
						<p class="break-all font-mono text-xs text-gray-700 select-all">
							{payment.pix_qr_code}
						</p>
					</div>
					<button
						onclick={copyPixCode}
						class="mt-3 flex items-center gap-2 mx-auto rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
					>
						<Copy class="h-4 w-4" />
						Copiar código Pix
					</button>
				{/if}

				<p class="mt-4 text-xs text-gray-400">
					O pagamento Pix é confirmado em segundos após a transferência.
				</p>
			</div>
		{/if}

		<!-- Boleto -->
		{#if mpStatus === 'pending' && payment?.boleto_url}
			<div class="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
				<div class="flex items-center gap-2 mb-4">
					<Receipt class="h-5 w-5 text-gray-600" />
					<h3 class="font-semibold text-gray-900">Boleto Bancário</h3>
				</div>
				{#if payment.boleto_barcode}
					<p class="mb-3 break-all font-mono text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
						{payment.boleto_barcode}
					</p>
				{/if}
				<a
					href={payment.boleto_url}
					target="_blank"
					rel="noopener noreferrer"
					class="block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
				>
					Visualizar boleto
				</a>
			</div>
		{/if}

		<!-- Order Items -->
		<div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm mb-6">
			<h3 class="mb-4 font-semibold text-gray-900">Itens do pedido</h3>
			<ul class="space-y-3">
				{#each order.items as item (item.id)}
					<li class="flex justify-between gap-2">
						<div>
							<p class="text-sm font-medium text-gray-800">{item.product_name}</p>
							<p class="text-xs text-gray-400">{item.product_brand} · Qtd: {item.quantity}</p>
						</div>
						<span class="text-sm font-semibold text-gray-800 shrink-0">
							{formatPrice(item.subtotal)}
						</span>
					</li>
				{/each}
			</ul>

			<div class="mt-4 border-t border-gray-100 pt-4 space-y-1.5 text-sm">
				<div class="flex justify-between text-gray-500">
					<span>Subtotal</span>
					<span>{formatPrice(order.subtotal)}</span>
				</div>
				<div class="flex justify-between text-gray-500">
					<span>Frete</span>
					<span class={order.shipping === 0 ? 'text-green-600 font-medium' : ''}>
						{order.shipping === 0 ? 'Grátis' : formatPrice(order.shipping)}
					</span>
				</div>
				<div class="flex justify-between border-t border-gray-100 pt-1.5 font-bold text-base text-gray-900">
					<span>Total</span>
					<span>{formatPrice(order.total)}</span>
				</div>
			</div>
		</div>

		<!-- Shipping Address -->
		{#if order.shipping_address}
			<div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm mb-6">
				<h3 class="mb-3 font-semibold text-gray-900">Endereço de entrega</h3>
				<address class="not-italic text-sm text-gray-600 space-y-0.5">
					{#if order.shipping_name}<p class="font-medium text-gray-800">{order.shipping_name}</p>{/if}
					<p>{order.shipping_address}</p>
					<p>
						{[order.shipping_city, order.shipping_state, order.shipping_zip]
							.filter(Boolean)
							.join(', ')}
					</p>
				</address>
			</div>
		{/if}

		<!-- Actions -->
		{#if mpStatus === 'rejected'}
			<a
				href="/store/checkout"
				class="block w-full rounded-xl bg-primary-500 py-3 text-center text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
			>
				Tentar novamente
			</a>
		{:else}
			<a
				href="/store"
				class="block w-full rounded-xl border border-gray-200 bg-white py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
			>
				Continuar comprando
			</a>
		{/if}
	</div>
</section>
