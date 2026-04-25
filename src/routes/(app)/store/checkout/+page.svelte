<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { goto } from "$app/navigation";
	import type { PageData } from "./$types";
	import { cartStore } from "$lib/stores/cart.store.svelte";
	import { uiStore } from "$lib/stores/ui.store.svelte";
	import { siteConfig } from "$lib/config/site.config";
	import { ShoppingBag, ChevronLeft, Loader2 } from "lucide-svelte";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let brickController: unknown = null;
	let brickLoading = $state(true);
	let submitting = $state(false);

	// Shipping form (pre-filled from profile)
	let shippingName = $state(data.profile?.full_name ?? "");
	let shippingAddress = $state(data.profile?.address_street ?? "");
	let shippingCity = $state(data.profile?.address_city ?? "");
	let shippingStateValue = $state(data.profile?.address_state ?? "");
	let shippingZip = $state(data.profile?.address_zip ?? "");

	const items = $derived(cartStore.items);
	const subtotal = $derived(cartStore.subtotal);
	const shipping = $derived(cartStore.shipping);
	const total = $derived(cartStore.total);

	function formatPrice(v: number) {
		return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
	}

	function loadMPScript(): Promise<void> {
		return new Promise((resolve, reject) => {
			if ((window as Window & { MercadoPago?: unknown }).MercadoPago) {
				resolve();
				return;
			}
			const script = document.createElement("script");
			script.src = "https://sdk.mercadopago.com/js/v2";
			script.onload = () => resolve();
			script.onerror = () =>
				reject(new Error("Falha ao carregar SDK do Mercado Pago"));
			document.head.appendChild(script);
		});
	}

	async function initBrick() {
		if (items.length === 0) {
			goto("/store");
			return;
		}

		try {
			await loadMPScript();

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const mp = new (window as any).MercadoPago(data.mpPublicKey, {
				locale: "pt-BR"
			}) as {
				bricks: () => {
					create: (
						name: string,
						id: string,
						settings: unknown
					) => Promise<unknown>;
				};
			};
			const bricks = mp.bricks();
			const capturedTotal = total;

			brickController = await bricks.create("payment", "mp-payment-brick", {
				initialization: {
					amount: capturedTotal,
					payer: {
						email: data.user.email ?? "",
						identification: {
							type: "CPF",
							number: data.profile?.cpf?.replace(/\D/g, "") ?? ""
						}
					}
				},
				customization: {
					paymentMethods: {
						creditCard: "all",
						debitCard: "all",
						ticket: "all",
						bankTransfer: "all",
						maxInstallments: 12
					},
					visual: {
						style: { theme: "default" }
					}
				},
				callbacks: {
					onReady: () => {
						brickLoading = false;
					},
					onSubmit: async ({ formData }: { formData: unknown }) => {
						submitting = true;
						try {
							// Explicitly extract fields — the brick's formData may not be a plain object
							// (getters/prototype props are lost in JSON.stringify), so we read each key.
							const fd = formData as Record<string, unknown>;
							const response = await fetch("/api/payments", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									formData: {
										token: fd.token,
										issuer_id: fd.issuer_id,
										payment_method_id: fd.payment_method_id,
										payment_type_id: fd.payment_type_id,
										transaction_amount: fd.transaction_amount,
										installments: fd.installments,
										payer: fd.payer
									},
									cartItems: items,
									shippingInfo: {
										name: shippingName,
										address: shippingAddress,
										city: shippingCity,
										state: shippingStateValue,
										zip: shippingZip
									}
								})
							});

							if (!response.ok) {
								const err = await response.json().catch(() => ({}));
								throw new Error(
									(err as { message?: string }).message ??
										"Erro ao processar pagamento"
								);
							}

							const result = (await response.json()) as { orderId: string };
							cartStore.clear();
							goto(`/store/pedido/${result.orderId}`);
						} catch (err) {
							submitting = false;
							const msg =
								err instanceof Error ? err.message : "Erro no pagamento";
							uiStore.error(msg);
							throw err;
						}
					},
					onError: (err: unknown) => {
						console.error("Mercado Pago Brick error:", err);
					}
				}
			});
		} catch (err) {
			brickLoading = false;
			uiStore.error("Não foi possível carregar o formulário de pagamento.");
		}
	}

	onMount(initBrick);

	onDestroy(() => {
		(brickController as { unmount?: () => void } | null)?.unmount?.();
	});
</script>

<svelte:head>
	<title>Checkout — {siteConfig.name}</title>
</svelte:head>

<div class="from-primary-500 to-secondary-500 bg-linear-to-br pt-32 pb-10">
	<div class="container-app text-center text-white">
		<div
			class="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold"
		>
			<ShoppingBag class="h-4 w-4" />
			Finalizar pedido
		</div>
		<h1 class="font-display text-3xl font-bold sm:text-4xl">Checkout</h1>
	</div>
</div>

<section class="section bg-gray-50">
	<div class="container-app max-w-5xl">
		<!-- Back link -->
		<a
			href="/store"
			class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
		>
			<ChevronLeft class="h-4 w-4" />
			Voltar à loja
		</a>

		{#if items.length === 0}
			<div class="rounded-2xl bg-white p-10 text-center shadow-sm">
				<p class="text-gray-500">Seu carrinho está vazio.</p>
				<a
					href="/store"
					class="text-primary-600 mt-2 inline-block text-sm font-medium hover:underline"
				>
					Ver produtos
				</a>
			</div>
		{:else}
			<div class="grid gap-8 lg:grid-cols-5">
				<!-- Left: Order summary + Address -->
				<div class="space-y-6 lg:col-span-2">
					<!-- Order Summary -->
					<div
						class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
					>
						<h2 class="mb-4 font-semibold text-gray-900">Resumo do pedido</h2>
						<ul class="space-y-3">
							{#each items as item (item.productId)}
								<li class="flex items-start justify-between gap-2">
									<div class="min-w-0">
										<p class="truncate text-sm font-medium text-gray-800">
											{item.name}
										</p>
										<p class="text-xs text-gray-400">
											{item.brand} · Qtd: {item.quantity}
										</p>
									</div>
									<span class="shrink-0 text-sm font-semibold text-gray-800">
										{formatPrice(item.price * item.quantity)}
									</span>
								</li>
							{/each}
						</ul>

						<div class="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
							<div class="flex justify-between text-gray-500">
								<span>Subtotal</span>
								<span>{formatPrice(subtotal)}</span>
							</div>
							<div class="flex justify-between text-gray-500">
								<span>Frete</span>
								<span
									class={shipping === 0 ? "font-medium text-green-600" : ""}
								>
									{shipping === 0 ? "Grátis" : formatPrice(shipping)}
								</span>
							</div>
							<div
								class="flex justify-between border-t border-gray-100 pt-1.5 text-base font-bold text-gray-900"
							>
								<span>Total</span>
								<span>{formatPrice(total)}</span>
							</div>
						</div>
					</div>

					<!-- Shipping Address -->
					<div
						class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
					>
						<h2 class="mb-4 font-semibold text-gray-900">
							Endereço de entrega
						</h2>
						<div class="space-y-3">
							<div>
								<label
									class="mb-1 block text-xs font-medium text-gray-600"
									for="shipping-name"
								>
									Nome completo
								</label>
								<input
									id="shipping-name"
									type="text"
									bind:value={shippingName}
									placeholder="Nome para entrega"
									class="focus:border-primary-400 focus:ring-primary-100 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2"
								/>
							</div>
							<div>
								<label
									class="mb-1 block text-xs font-medium text-gray-600"
									for="shipping-address"
								>
									Endereço
								</label>
								<input
									id="shipping-address"
									type="text"
									bind:value={shippingAddress}
									placeholder="Rua, número, complemento"
									class="focus:border-primary-400 focus:ring-primary-100 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2"
								/>
							</div>
							<div class="grid grid-cols-2 gap-3">
								<div>
									<label
										class="mb-1 block text-xs font-medium text-gray-600"
										for="shipping-city"
									>
										Cidade
									</label>
									<input
										id="shipping-city"
										type="text"
										bind:value={shippingCity}
										placeholder="Cidade"
										class="focus:border-primary-400 focus:ring-primary-100 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2"
									/>
								</div>
								<div>
									<label
										class="mb-1 block text-xs font-medium text-gray-600"
										for="shipping-state"
									>
										Estado
									</label>
									<input
										id="shipping-state"
										type="text"
										bind:value={shippingStateValue}
										placeholder="UF"
										maxlength={2}
										class="focus:border-primary-400 focus:ring-primary-100 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2"
									/>
								</div>
							</div>
							<div>
								<label
									class="mb-1 block text-xs font-medium text-gray-600"
									for="shipping-zip"
								>
									CEP
								</label>
								<input
									id="shipping-zip"
									type="text"
									bind:value={shippingZip}
									placeholder="00000-000"
									maxlength={9}
									class="focus:border-primary-400 focus:ring-primary-100 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2"
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- Right: MP Payment Brick -->
				<div class="lg:col-span-3">
					<div
						class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
					>
						<h2 class="mb-4 font-semibold text-gray-900">Forma de pagamento</h2>

						{#if brickLoading}
							<div class="flex items-center justify-center py-16">
								<div class="flex flex-col items-center gap-3 text-gray-400">
									<Loader2 class="h-8 w-8 animate-spin" />
									<p class="text-sm">Carregando opções de pagamento…</p>
								</div>
							</div>
						{/if}

						{#if submitting}
							<div
								class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80"
							>
								<div class="flex flex-col items-center gap-3 text-gray-600">
									<Loader2 class="h-8 w-8 animate-spin" />
									<p class="text-sm font-medium">Processando pagamento…</p>
								</div>
							</div>
						{/if}

						<div id="mp-payment-brick" class:hidden={brickLoading}></div>

						<p class="mt-4 text-center text-xs text-gray-400">
							Pagamento processado com segurança pelo
							<strong class="text-gray-500">Mercado Pago</strong>
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>
