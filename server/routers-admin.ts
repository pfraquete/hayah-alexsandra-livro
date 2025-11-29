import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { 
  getAllOrders, 
  updateOrderStatus, 
  updateOrderAdminNotes,
  getAllUsers,
  getOrderWithUser
} from "./db-admin";

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
  }),
});
