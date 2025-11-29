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
  getOrderItems
} from "./db-products";

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
      
      return {
        orderId,
        totalCents,
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
});
