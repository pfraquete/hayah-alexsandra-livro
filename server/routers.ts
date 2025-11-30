import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { productsRouter, checkoutRouter, ordersRouter, profileRouter, addressRouter } from "./routers-products";
import { adminRouter } from "./routers-admin";
import { socialRouter } from "./routers-social";
import { marketplaceRouter } from "./routers-courses";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: productsRouter,
  checkout: checkoutRouter,
  orders: ordersRouter,
  profile: profileRouter,
  addresses: addressRouter,
  admin: adminRouter,

  // Social Network & Community
  social: socialRouter,

  // Marketplace (Courses & Digital Products)
  marketplace: marketplaceRouter,
});

export type AppRouter = typeof appRouter;
