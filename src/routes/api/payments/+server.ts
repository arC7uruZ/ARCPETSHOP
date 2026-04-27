import { json } from '@sveltejs/kit';
import { MercadoPagoConfig, Order } from 'mercadopago';
import {
    MERCADOPAGO_ACCESS_TOKEN,
    MERCADOPAGO_IDEMPOTENCY_KEY_PREFIX
} from '$env/static/private';
import { fetchProductsByIds } from '$lib/server/products.server';
import { createOrder, updateOrderMpOrder, storePayment } from '$lib/server/orders.server';
import logger from '$lib/server/logger';
import type { RequestHandler } from './$types';
import type { CartItem } from '$lib/types';

interface PaymentBody {
    formData: Record<string, unknown>;
    cartItems: CartItem[];
    shippingInfo: {
        name?: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
    };
}

export const POST: RequestHandler = async ({ request, locals }) => {
    const { user } = await locals.safeGetSession();
    if (!user) {
        logger.warn('Unauthenticated checkout attempt');
        return json({ error: 'Não autenticado' }, { status: 401 });
    }

    const log = logger.child({ userId: user.id });

    let body: PaymentBody;
    try {
        body = await request.json();
    } catch {
        log.warn('Invalid JSON body on checkout request');
        return json({ error: 'Requisição inválida' }, { status: 400 });
    }

    const { formData, cartItems, shippingInfo } = body;

    if (!cartItems?.length) {
        log.warn('Checkout attempted with empty cart');
        return json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    log.info({ itemCount: cartItems.length }, 'Checkout started');

    // Validate cart against DB prices (never trust client prices)
    const productIds = cartItems.map((i) => i.productId);
    const products = await fetchProductsByIds(locals.supabase, productIds);

    if (products.length !== productIds.length) {
        log.warn(
            { requested: productIds.length, found: products.length },
            'One or more products unavailable during price validation'
        );
        return json({ error: 'Um ou mais produtos não estão disponíveis' }, { status: 422 });
    }

    let subtotal = 0;
    const validatedItems = cartItems.map((cartItem) => {
        const product = products.find((p) => p.id === cartItem.productId);
        if (!product) throw new Error(`Produto não encontrado: ${cartItem.productId}`);
        const itemSubtotal = product.price * cartItem.quantity;
        subtotal += itemSubtotal;
        return {
            productId: product.id,
            productName: product.name,
            productBrand: product.brand,
            unitPrice: product.price,
            quantity: cartItem.quantity,
            subtotal: itemSubtotal
        };
    });

    const shippingCost = subtotal >= 150 ? 0 : 15;
    const total = subtotal + shippingCost;

    log.debug({ subtotal, shippingCost, total }, 'Order totals calculated');

    // Create order in DB
    const order = await createOrder(locals.supabase, {
        userId: user.id,
        items: validatedItems,
        subtotal,
        shipping: shippingCost,
        total,
        shippingInfo
    });

    log.info({ orderId: order.id, total }, 'Internal order created');

    const client = new MercadoPagoConfig({
        accessToken: MERCADOPAGO_ACCESS_TOKEN,
        options: { timeout: 10000 }
    });
    const orderClient = new Order(client);

    const payer = (formData.payer ?? {}) as Record<string, unknown>;
    const payerIdentification = payer.identification as { type?: string; number?: string } | undefined;
    const paymentMethodId = formData.payment_method_id as string | undefined;
    const token = formData.token as string | undefined;
    const installments = (formData.installments as number | undefined) ?? 1;

    // Infer payment type when the brick doesn't send payment_type_id (e.g. PIX)
    const PIX_METHOD_IDS = new Set(['pix']);
    const TICKET_METHOD_IDS = new Set(['bolbradesco', 'pec', 'boleto']);
    const rawPaymentTypeId = formData.payment_type_id as string | undefined;
    const paymentTypeId =
        rawPaymentTypeId ??
        (paymentMethodId && PIX_METHOD_IDS.has(paymentMethodId)
            ? 'bank_transfer'
            : paymentMethodId && TICKET_METHOD_IDS.has(paymentMethodId)
              ? 'ticket'
              : 'credit_card');

    log.debug(
        { orderId: order.id, paymentMethodId, paymentTypeId, installments },
        'Calling MP Orders API'
    );

    let mpOrder;
    try {
        mpOrder = await orderClient.create({
            body: {
                type: 'online',
                external_reference: order.id,
                description: `ArcPetShop - Pedido ${order.id.slice(0, 8).toUpperCase()}`,
                payer: {
                    email: (payer.email as string | undefined) ?? user.email ?? '',
                    first_name: "APRO",
                    ...(payerIdentification
                        ? { identification: { type: payerIdentification.type, number: payerIdentification.number } }
                        : {})
                },
                items: [
                    ...validatedItems.map((item) => ({
                        title: item.productName,
                        unit_price: String(item.unitPrice),
                        quantity: item.quantity,
                        external_code: item.productId.replace(/-/g, '').slice(0, 30)
                    })),
                    ...(shippingCost > 0
                        ? [{ title: 'Frete', unit_price: String(shippingCost), quantity: 1, external_code: 'shipping' }]
                        : [])
                ],
                total_amount: String(total),
                transactions: {
                    payments: [
                        {
                            amount: String(total),
                            payment_method: {
                                id: paymentMethodId,
                                type: paymentTypeId,
                                ...(token ? { token } : {}),
                                ...(paymentTypeId === 'credit_card' ? { installments } : {})
                            }
                        }
                    ]
                }
            },
            requestOptions: {
                idempotencyKey: `${MERCADOPAGO_IDEMPOTENCY_KEY_PREFIX ?? 'arc'}-${order.id}`
            }
        });
    } catch (mpErr) {
        log.error({ err: mpErr, orderId: order.id }, 'MP Orders API call failed');
        return json(
            { error: 'Erro ao processar pedido com Mercado Pago', orderId: order.id },
            { status: 502 }
        );
    }

    const mpOrderId = mpOrder.id ?? '';
    const mpOrderStatus = mpOrder.status ?? 'unknown';
    const firstPayment = mpOrder.transactions?.payments?.[0];
    const mpPaymentId = firstPayment?.id ?? '';
    const mpPaymentMethod = firstPayment?.payment_method;

    log.info(
        { orderId: order.id, mpOrderId, mpOrderStatus, mpPaymentId, mpPaymentStatus: firstPayment?.status },
        'MP order created successfully'
    );
    log.debug(
        { mpPaymentMethod, hasQrCode: !!(mpPaymentMethod as Record<string, unknown>)?.qr_code, hasQrBase64: !!(mpPaymentMethod as Record<string, unknown>)?.qr_code_base64 },
        'MP payment method details'
    );

    await storePayment(locals.supabase, {
        orderId: order.id,
        mpPaymentId,
        mpStatus: firstPayment?.status ?? 'unknown',
        mpStatusDetail: firstPayment?.status_detail ?? undefined,
        mpPaymentMethod: mpPaymentMethod?.id ?? undefined,
        mpPaymentType: mpPaymentMethod?.type ?? undefined,
        pixQrCode: mpPaymentMethod?.qr_code ?? undefined,
        pixQrCodeBase64: mpPaymentMethod?.qr_code_base64 ?? undefined,
        pixExpirationDate: firstPayment?.date_of_expiration ?? undefined,
        boletoUrl: mpPaymentMethod?.ticket_url ?? undefined,
        boletoBarcode: mpPaymentMethod?.barcode_content ?? undefined,
        rawResponse: mpOrder as unknown as Record<string, unknown>
    });

    await updateOrderMpOrder(locals.supabase, order.id, mpOrderId, mpOrderStatus);

    log.info({ orderId: order.id, mpOrderId }, 'Checkout completed');

    return json({
        orderId: order.id,
        mpOrderId,
        status: mpOrderStatus,
        statusDetail: mpOrder.status_detail
    });
};
