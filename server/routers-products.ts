import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getActiveProducts,
  getProductBySlug,
  getProductById,
  createOrder,
  createOrderItems,
  createAddress,
  getUserAddresses,
  getUserOrders,
  getOrderById,
  getOrderItems,
  updateUserProfile,
  getUserById,
  updateAddress,
  deleteAddress,
  getOrderWithTracking,
} from "./db-products";
import { trackShipment } from "./services/tracking";
import {
  createPixPayment,
  createBoletoPayment,
  createCreditCardPayment,
  isPagarmeConfigured,
  type PaymentResult
} from "./services/pagarme";
import { sendEmail, orderConfirmationEmail } from "./services/email";

export const productsRouter = router({
  list: publicProcedure.query(async () => {
    return await getActiveProducts();
  }),
  
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await getProductBySlug(input.slug);
    }),
});

export const checkoutRouter = router({
  calculateShipping: publicProcedure
    .input(z.object({
      cep: z.string(),
      productId: z.number(),
      quantity: z.number(),
    }))
    .mutation(async ({ input }) => {
      // Simulação de cálculo de frete
      // TODO: Integrar com API do Melhor Envio ou Correios
      const basePrice = 1500; // R$ 15,00
      const days = Math.floor(Math.random() * 10) + 5; // 5-15 dias
      
      return {
        options: [
          {
            name: 'PAC',
            priceCents: basePrice,
            deliveryDays: days + 5,
            code: 'PAC',
          },
          {
            name: 'SEDEX',
            priceCents: basePrice + 1000, // R$ 10,00 a mais
            deliveryDays: days,
            code: 'SEDEX',
          },
        ],
      };
    }),
  
  createOrder: protectedProcedure
    .input(z.object({
      productId: z.number(),
      quantity: z.number(),
      shippingMethod: z.string(),
      shippingPriceCents: z.number(),
      address: z.object({
        recipientName: z.string(),
        cep: z.string(),
        street: z.string(),
        number: z.string(),
        complement: z.string().optional(),
        district: z.string(),
        city: z.string(),
        state: z.string(),
      }),
      paymentMethod: z.enum(['credit_card', 'pix', 'boleto']),
      customerNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Buscar produto pelo ID informado
      const product = await getProductById(input.productId);
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      // Verificar se o produto está ativo
      if (!product.active) {
        throw new Error('Produto não disponível para venda');
      }
      
      // Calcular valores
      const subtotalCents = product.priceCents * input.quantity;
      const totalCents = subtotalCents + input.shippingPriceCents;
      
      // Criar endereço
      const addressId = await createAddress({
        userId: ctx.user.id,
        ...input.address,
        isDefault: false,
      });
      
      // Criar pedido
      const orderId = await createOrder({
        userId: ctx.user.id,
        addressId,
        subtotalCents,
        shippingPriceCents: input.shippingPriceCents,
        discountCents: 0,
        totalCents,
        status: 'AGUARDANDO_PAGAMENTO',
        paymentMethod: input.paymentMethod,
        shippingAddress: input.address,
        customerNotes: input.customerNotes || null,
        adminNotes: null,
        paidAt: null,
        shippedAt: null,
        deliveredAt: null,
        cancelledAt: null,
      });
      
      // Criar itens do pedido
      await createOrderItems([{
        orderId,
        productId: product.id,
        quantity: input.quantity,
        unitPriceCents: product.priceCents,
        totalPriceCents: subtotalCents,
        productName: product.name,
      }]);

      // Processar pagamento baseado no método escolhido
      let paymentResult: PaymentResult | null = null;
      const customer = {
        name: input.address.recipientName,
        email: ctx.user.email || '',
        document: ctx.user.cpf || '',
      };
      const billingAddress = {
        street: input.address.street,
        number: input.address.number,
        complement: input.address.complement,
        neighborhood: input.address.district,
        city: input.address.city,
        state: input.address.state,
        zipCode: input.address.cep.replace(/\D/g, ''),
        country: 'BR',
      };

      if (input.paymentMethod === 'pix') {
        paymentResult = await createPixPayment({
          amountCents: totalCents,
          customer,
          orderId: String(orderId),
        });
      } else if (input.paymentMethod === 'boleto') {
        paymentResult = await createBoletoPayment({
          amountCents: totalCents,
          customer,
          billingAddress,
          orderId: String(orderId),
        });
      }
      // Credit card requires card data which should be sent in a separate step

      // Enviar e-mail de confirmação do pedido
      if (ctx.user.email) {
        const emailContent = orderConfirmationEmail({
          customerName: input.address.recipientName,
          orderId,
          items: [{
            name: product.name,
            quantity: input.quantity,
            priceCents: product.priceCents * input.quantity,
          }],
          subtotalCents,
          shippingCents: input.shippingPriceCents,
          totalCents,
          shippingAddress: input.address,
          paymentMethod: input.paymentMethod,
        });

        // Enviar e-mail de forma assíncrona (não bloqueia o fluxo)
        sendEmail({
          to: ctx.user.email,
          ...emailContent,
        }).catch(err => {
          console.error('[Email] Failed to send order confirmation:', err);
        });
      }

      return {
        orderId,
        totalCents,
        payment: paymentResult,
      };
    }),
});

export const ordersRouter = router({
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return await getUserOrders(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const order = await getOrderById(input.id);

      if (!order || order.userId !== ctx.user.id) {
        throw new Error('Pedido não encontrado');
      }

      const items = await getOrderItems(input.id);

      return {
        ...order,
        items,
      };
    }),

  // Get order with tracking information
  getWithTracking: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const orderData = await getOrderWithTracking(input.id, ctx.user.id);

      if (!orderData) {
        throw new Error('Pedido não encontrado');
      }

      // If there's a tracking code, fetch live tracking info
      let trackingInfo = null;
      if (orderData.shipment?.trackingCode) {
        trackingInfo = await trackShipment(orderData.shipment.trackingCode);
      }

      return {
        ...orderData,
        tracking: trackingInfo,
      };
    }),
});

// User Profile Router
export const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await getUserById(ctx.user.id);
  }),

  update: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      phone: z.string().optional(),
      cpf: z.string().length(11).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

// Address Router
export const addressRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getUserAddresses(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({
      recipientName: z.string(),
      cep: z.string(),
      street: z.string(),
      number: z.string(),
      complement: z.string().optional(),
      district: z.string(),
      city: z.string(),
      state: z.string().length(2),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const addressId = await createAddress({
        userId: ctx.user.id,
        ...input,
        isDefault: input.isDefault ?? false,
      });
      return { success: true, addressId };
    }),

  update: protectedProcedure
    .input(z.object({
      addressId: z.number(),
      recipientName: z.string().optional(),
      cep: z.string().optional(),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      district: z.string().optional(),
      city: z.string().optional(),
      state: z.string().length(2).optional(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { addressId, ...data } = input;
      await updateAddress(addressId, ctx.user.id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ addressId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteAddress(input.addressId, ctx.user.id);
      return { success: true };
    }),
});
