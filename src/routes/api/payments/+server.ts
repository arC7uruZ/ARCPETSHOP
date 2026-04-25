import { json } from '@sveltejs/kit';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import {
    MERCADOPAGO_ACCESS_TOKEN,
    MERCADOPAGO_IDEMPOTENCY_KEY_PREFIX
} from '$env/static/private';
import { fetchProductsByIds } from '$lib/server/products.server';
import { createOrder, updateOrderPayment, storePayment } from '$lib/server/orders.server';
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
    if (!user) return json({ error: 'Não autenticado' }, { status: 401 });

    let body: PaymentBody;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Requisição inválida' }, { status: 400 });
    }

    const { formData, cartItems, shippingInfo } = body;

    if (!cartItems?.length) {
        return json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    // Validate cart against DB prices (never trust client prices)
    const productIds = cartItems.map((i) => i.productId);
    const products = await fetchProductsByIds(locals.supabase, productIds);

    if (products.length !== productIds.length) {
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

    // Create order in DB
    const order = await createOrder(locals.supabase, {
        userId: user.id,
        items: validatedItems,
        subtotal,
        shipping: shippingCost,
        total,
        shippingInfo
    });

    const client = new MercadoPagoConfig({
        accessToken: MERCADOPAGO_ACCESS_TOKEN,
        options: { timeout: 10000 }
    });
    const paymentClient = new Payment(client);

    const payer = (formData.payer ?? {}) as Record<string, unknown>;
    const paymentMethodId = formData.payment_method_id as string | undefined;
    const token = formData.token as string | undefined;
    const installments = (formData.installments as number | undefined) ?? 1;

    let mpPayment;
    try {
        mpPayment = await paymentClient.create({
            body: {
                transaction_amount: total,
                payment_method_id: paymentMethodId,
                ...(token ? { token } : {}),
                installments,
                payer: {
                    email: user.email ?? (payer.email as string | undefined) ?? '',
                    ...(payer.identification
                        ? { identification: payer.identification as { type: string; number: string } }
                        : {})
                },
                external_reference: order.id,
                description: `ArcPetShop - Pedido ${order.id.slice(0, 8).toUpperCase()}`
            },
            requestOptions: {
                idempotencyKey: `${MERCADOPAGO_IDEMPOTENCY_KEY_PREFIX ?? 'arc'}-${order.id}`
            }
        });
    } catch (mpErr) {
        console.error('MP Payment error:', mpErr);
        return json(
            { error: 'Erro ao processar pagamento com Mercado Pago', orderId: order.id },
            { status: 502 }
        );
    }

    const mpPaymentId = String(mpPayment.id ?? '');
    const txData = mpPayment.point_of_interaction?.transaction_data;

    await storePayment(locals.supabase, {
        orderId: order.id,
        mpPaymentId,
        mpStatus: mpPayment.status ?? 'unknown',
        mpStatusDetail: mpPayment.status_detail ?? undefined,
        mpPaymentMethod: mpPayment.payment_method_id ?? undefined,
        mpPaymentType: mpPayment.payment_type_id ?? undefined,
        pixQrCode: txData?.qr_code ?? undefined,
        pixQrCodeBase64: txData?.qr_code_base64 ?? undefined,
        pixExpirationDate: mpPayment.date_of_expiration ?? undefined,
        boletoUrl: mpPayment.transaction_details?.external_resource_url ?? undefined,
        boletoBarcode: (mpPayment as unknown as Record<string, unknown>)?.barcode
            ? ((mpPayment as unknown as { barcode: { content?: string } }).barcode?.content ?? undefined)
            : undefined,
        rawResponse: mpPayment as unknown as Record<string, unknown>
    });

    await updateOrderPayment(locals.supabase, order.id, mpPaymentId, mpPayment.status ?? '');

    return json({
        orderId: order.id,
        paymentId: mpPaymentId,
        status: mpPayment.status,
        statusDetail: mpPayment.status_detail
    });
};
