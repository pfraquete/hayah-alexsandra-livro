import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllOrders,
  updateOrderStatus,
  updateOrderAdminNotes,
  getAllUsers,
  getOrderWithUser,
  getShipmentByOrderId,
  updateShipmentTracking,
  updateShipmentStatus,
  getAllProducts,
  updateProductStock,
  updateProduct,
  createProduct,
  deleteProduct,
  getAllPosts,
  adminDeletePost,
  getAllComments,
  adminDeleteComment,
  updateUser,
} from "./db-admin";
import { trackShipment, getTrackingUrl } from "./services/tracking";
import { sendEmail, orderStatusUpdateEmail } from "./services/email";

// Middleware para verificar se o usuário é admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  orders: router({
    list: adminProcedure.query(async () => {
      return await getAllOrders();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getOrderWithUser(input.id);
      }),

    updateStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum([
          'AGUARDANDO_PAGAMENTO',
          'PAGO',
          'EM_SEPARACAO',
          'POSTADO',
          'EM_TRANSITO',
          'ENTREGUE',
          'CANCELADO',
          'REEMBOLSADO',
        ]),
      }))
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),

    updateNotes: adminProcedure
      .input(z.object({
        orderId: z.number(),
        adminNotes: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateOrderAdminNotes(input.orderId, input.adminNotes);
        return { success: true };
      }),
  }),

  users: router({
    list: adminProcedure.query(async () => {
      return await getAllUsers();
    }),

    update: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]).optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { userId, ...data } = input;
        await updateUser(userId, data);
        return { success: true };
      }),
  }),

  // Shipment/Tracking Management
  shipments: router({
    getByOrderId: adminProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return await getShipmentByOrderId(input.orderId);
      }),

    addTracking: adminProcedure
      .input(z.object({
        orderId: z.number(),
        trackingCode: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const trackingUrl = getTrackingUrl(input.trackingCode);
        await updateShipmentTracking(input.orderId, input.trackingCode, trackingUrl);

        // Update order status to POSTADO
        await updateOrderStatus(input.orderId, "POSTADO");

        // Send email notification to customer
        const orderData = await getOrderWithUser(input.orderId);
        if (orderData?.user?.email) {
          const emailContent = orderStatusUpdateEmail({
            customerName: orderData.user.name || "Cliente",
            orderId: input.orderId,
            status: "POSTADO",
            trackingCode: input.trackingCode,
            trackingUrl,
          });

          sendEmail({
            to: orderData.user.email,
            ...emailContent,
          }).catch(err => {
            console.error("[Email] Failed to send tracking notification:", err);
          });
        }

        return { success: true, trackingUrl };
      }),

    updateStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum([
          "PENDENTE",
          "ETIQUETA_GERADA",
          "POSTADO",
          "EM_TRANSITO",
          "SAIU_PARA_ENTREGA",
          "ENTREGUE",
          "DEVOLVIDO",
        ]),
      }))
      .mutation(async ({ input }) => {
        await updateShipmentStatus(input.orderId, input.status);

        // Sync with order status if needed
        if (input.status === "ENTREGUE") {
          await updateOrderStatus(input.orderId, "ENTREGUE");
        }

        return { success: true };
      }),

    track: adminProcedure
      .input(z.object({ trackingCode: z.string() }))
      .query(async ({ input }) => {
        return await trackShipment(input.trackingCode);
      }),
  }),

  // Product/Stock Management
  products: router({
    list: adminProcedure.query(async () => {
      return await getAllProducts();
    }),

    updateStock: adminProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        await updateProductStock(input.productId, input.quantity);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        productId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        priceCents: z.number().optional(),
        compareAtPriceCents: z.number().nullable().optional(),
        stockQuantity: z.number().optional(),
        active: z.boolean().optional(),
        imageUrl: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { productId, ...data } = input;
        await updateProduct(productId, data);
        return { success: true };
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        priceCents: z.number(),
        compareAtPriceCents: z.number().optional(),
        stockQuantity: z.number().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const productId = await createProduct(input);
        return { success: true, productId };
      }),

    delete: adminProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.productId);
        return { success: true };
      }),
  }),

  // Social Moderation
  social: router({
    listPosts: adminProcedure.query(async () => {
      return await getAllPosts();
    }),
    deletePost: adminProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input }) => {
        await adminDeletePost(input.postId);
        return { success: true };
      }),
    listComments: adminProcedure.query(async () => {
      return await getAllComments();
    }),
    deleteComment: adminProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input }) => {
        await adminDeleteComment(input.commentId);
        return { success: true };
      }),
  }),
});
