var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// vite.config.ts
var vite_config_exports = {};
__export(vite_config_exports, {
  default: () => vite_config_default
});
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
var plugins, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    plugins = [react(), tailwindcss(), jsxLocPlugin()];
    vite_config_default = defineConfig({
      plugins,
      resolve: {
        alias: {
          "@": path.resolve(import.meta.dirname, "client", "src"),
          "@shared": path.resolve(import.meta.dirname, "shared"),
          "@assets": path.resolve(import.meta.dirname, "attached_assets")
        }
      },
      envDir: path.resolve(import.meta.dirname),
      root: path.resolve(import.meta.dirname, "client"),
      publicDir: path.resolve(import.meta.dirname, "client", "public"),
      build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true
      },
      server: {
        host: true,
        allowedHosts: [
          "localhost",
          "127.0.0.1"
        ],
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers-products.ts
import { z as z3 } from "zod";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
var supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
var supabase = createClient(supabaseUrl, supabaseAnonKey);
var supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;
async function getSupabaseUser(accessToken) {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    if (error) console.error("[Supabase] Error validating user token:", error);
    return null;
  }
  return data.user;
}

// server/db-products.ts
async function getActiveProducts() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("products").select("*").eq("active", true);
  if (error) {
    console.error("[Database] Error fetching active products:", error);
    return [];
  }
  return data || [];
}
async function getProductBySlug(slug) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("products").select("*").eq("slug", slug).limit(1).single();
  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[Database] Error fetching product by slug:", error);
    }
    return null;
  }
  return data;
}
async function getProductById(id) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("products").select("*").eq("id", id).limit(1).single();
  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[Database] Error fetching product by id:", error);
    }
    return null;
  }
  return data;
}
async function createOrder(orderData) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data, error } = await supabaseAdmin.from("orders").insert({
    ...orderData,
    status: orderData.status || "AGUARDANDO_PAGAMENTO",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating order:", error);
    throw error;
  }
  return data.id;
}
async function createOrderItems(items) {
  if (!supabaseAdmin) throw new Error("Database not available");
  if (items.length === 0) return;
  const itemsWithTimestamp = items.map((item) => ({
    ...item,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }));
  const { error } = await supabaseAdmin.from("orderItems").insert(itemsWithTimestamp);
  if (error) {
    console.error("[Database] Error creating order items:", error);
    throw error;
  }
}
async function createAddress(addressData) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data, error } = await supabaseAdmin.from("addresses").insert({
    ...addressData,
    isDefault: addressData.isDefault ?? false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating address:", error);
    throw error;
  }
  return data.id;
}
async function getUserAddresses(userId) {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("addresses").select("*").eq("userId", userId);
  if (error) {
    console.error("[Database] Error fetching user addresses:", error);
    return [];
  }
  return data || [];
}
async function getUserOrders(userId) {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("orders").select("*").eq("userId", userId).order("createdAt", { ascending: false });
  if (error) {
    console.error("[Database] Error fetching user orders:", error);
    return [];
  }
  return data || [];
}
async function getOrderById(orderId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).limit(1).single();
  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[Database] Error fetching order:", error);
    }
    return null;
  }
  return data;
}
async function getOrderItems(orderId) {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("orderItems").select("*").eq("orderId", orderId);
  if (error) {
    console.error("[Database] Error fetching order items:", error);
    return [];
  }
  return data || [];
}
async function updateUserProfile(userId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("users").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", userId);
  if (error) {
    console.error("[Database] Error updating user profile:", error);
    throw error;
  }
}
async function getUserById(userId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", userId).limit(1).single();
  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[Database] Error fetching user:", error);
    }
    return null;
  }
  return data;
}
async function updateAddress(addressId, userId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: existing, error: fetchError } = await supabaseAdmin.from("addresses").select("*").eq("id", addressId).single();
  if (fetchError || !existing || existing.userId !== userId) {
    throw new Error("Address not found");
  }
  if (data.isDefault) {
    await supabaseAdmin.from("addresses").update({ isDefault: false, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).eq("userId", userId);
  }
  const { error } = await supabaseAdmin.from("addresses").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", addressId);
  if (error) {
    console.error("[Database] Error updating address:", error);
    throw error;
  }
}
async function deleteAddress(addressId, userId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: existing, error: fetchError } = await supabaseAdmin.from("addresses").select("*").eq("id", addressId).single();
  if (fetchError || !existing || existing.userId !== userId) {
    throw new Error("Address not found");
  }
  const { error } = await supabaseAdmin.from("addresses").delete().eq("id", addressId);
  if (error) {
    console.error("[Database] Error deleting address:", error);
    throw error;
  }
}
async function getOrderWithTracking(orderId, userId) {
  if (!supabaseAdmin) return null;
  const { data: order, error: orderError } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).single();
  if (orderError || !order || order.userId !== userId) {
    return null;
  }
  const { data: items } = await supabaseAdmin.from("orderItems").select("*").eq("orderId", orderId);
  const { data: shipment } = await supabaseAdmin.from("shipments").select("*").eq("orderId", orderId).limit(1).single();
  return {
    ...order,
    items: items || [],
    shipment: shipment || null
  };
}
async function decrementProductStock(productId, quantity) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const product = await getProductById(productId);
  if (!product) throw new Error("Product not found");
  const currentStock = product.stockQuantity ?? 0;
  if (currentStock < quantity) {
    throw new Error("Insufficient stock");
  }
  const { error } = await supabaseAdmin.from("products").update({
    stockQuantity: currentStock - quantity,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", productId);
  if (error) {
    console.error("[Database] Error decrementing stock:", error);
    throw error;
  }
}
async function getCreatorProducts(creatorId) {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("products").select("*").eq("creatorId", creatorId).order("createdAt", { ascending: false });
  if (error) {
    console.error("[Database] Error fetching creator products:", error);
    return [];
  }
  return data || [];
}
async function createProduct(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("products").insert({
    ...data,
    active: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("*").single();
  if (error) {
    console.error("[Database] Error creating product:", error);
    throw error;
  }
  return result;
}
async function updateProduct(productId, creatorId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: existing, error: fetchError } = await supabaseAdmin.from("products").select("*").eq("id", productId).eq("creatorId", creatorId).single();
  if (fetchError || !existing) {
    throw new Error("Produto n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
  }
  const { data: result, error } = await supabaseAdmin.from("products").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", productId).select("*").single();
  if (error) {
    console.error("[Database] Error updating product:", error);
    throw error;
  }
  return result;
}
async function deleteCreatorProduct(productId, creatorId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: existing, error: fetchError } = await supabaseAdmin.from("products").select("id").eq("id", productId).eq("creatorId", creatorId).single();
  if (fetchError || !existing) {
    throw new Error("Produto n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
  }
  const { error } = await supabaseAdmin.from("products").delete().eq("id", productId);
  if (error) {
    console.error("[Database] Error deleting product:", error);
    throw error;
  }
}
async function toggleProductActive(productId, creatorId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: existing, error: fetchError } = await supabaseAdmin.from("products").select("*").eq("id", productId).eq("creatorId", creatorId).single();
  if (fetchError || !existing) {
    throw new Error("Produto n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
  }
  const { data: result, error } = await supabaseAdmin.from("products").update({
    active: !existing.active,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", productId).select("*").single();
  if (error) {
    console.error("[Database] Error toggling product active:", error);
    throw error;
  }
  return result;
}

// server/services/tracking.ts
var CARRIER_PATTERNS = {
  correios: /^[A-Z]{2}\d{9}[A-Z]{2}$/,
  jadlog: /^\d{14}$/,
  loggi: /^[A-Z0-9]{10,}$/
};
function detectCarrier(trackingCode) {
  for (const [carrier, pattern] of Object.entries(CARRIER_PATTERNS)) {
    if (pattern.test(trackingCode.toUpperCase())) {
      return carrier;
    }
  }
  return "unknown";
}
function getTrackingUrl(trackingCode, carrier) {
  const detectedCarrier = carrier || detectCarrier(trackingCode);
  const urls = {
    correios: `https://www.linkcorreios.com.br/?id=${trackingCode}`,
    jadlog: `https://www.jadlog.com.br/jadlog/tracking?cte=${trackingCode}`,
    loggi: `https://www.loggi.com/rastreio/${trackingCode}`,
    unknown: `https://www.google.com/search?q=rastrear+${trackingCode}`
  };
  return urls[detectedCarrier] || urls.unknown;
}
async function trackCorreios(trackingCode) {
  console.log(`[Tracking] Fetching Correios tracking for: ${trackingCode}`);
  const simulatedEvents = [
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3),
      location: "S\xE3o Paulo - SP",
      status: "posted",
      description: "Objeto postado"
    },
    {
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1e3),
      location: "S\xE3o Paulo - SP",
      status: "in_transit",
      description: "Objeto em tr\xE2nsito - por favor aguarde"
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3),
      location: "Centro de Distribui\xE7\xE3o - Destino",
      status: "in_transit",
      description: "Objeto em tr\xE2nsito - por favor aguarde"
    }
  ];
  return {
    success: true,
    trackingCode,
    carrier: "correios",
    status: "in_transit",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3),
    events: simulatedEvents
  };
}
async function trackShipment(trackingCode) {
  const carrier = detectCarrier(trackingCode);
  try {
    switch (carrier) {
      case "correios":
        return await trackCorreios(trackingCode);
      case "jadlog":
      case "loggi":
        return {
          success: true,
          trackingCode,
          carrier,
          status: "in_transit",
          events: [
            {
              date: /* @__PURE__ */ new Date(),
              location: "Em tr\xE2nsito",
              status: "in_transit",
              description: "Pacote em tr\xE2nsito para o destino"
            }
          ]
        };
      default:
        return {
          success: false,
          trackingCode,
          carrier: "unknown",
          status: "unknown",
          events: [],
          error: "Transportadora n\xE3o identificada"
        };
    }
  } catch (error) {
    console.error("[Tracking] Error:", error);
    return {
      success: false,
      trackingCode,
      carrier,
      status: "error",
      events: [],
      error: error instanceof Error ? error.message : "Erro ao rastrear"
    };
  }
}

// server/services/pagarme.ts
import { z as z2 } from "zod";
var PAGARME_API_KEY = process.env.PAGARME_API_KEY;
var PAGARME_API_URL = process.env.PAGARME_API_URL || "https://api.pagar.me/core/v5";
var creditCardSchema = z2.object({
  number: z2.string().min(13).max(19),
  holderName: z2.string().min(3),
  expMonth: z2.number().min(1).max(12),
  expYear: z2.number().min(2024),
  cvv: z2.string().length(3)
});
var customerSchema = z2.object({
  name: z2.string().min(3),
  email: z2.string().email(),
  document: z2.string().min(11).max(14),
  // CPF or CNPJ
  phone: z2.string().optional()
});
var addressSchema = z2.object({
  street: z2.string(),
  number: z2.string(),
  complement: z2.string().optional(),
  neighborhood: z2.string(),
  city: z2.string(),
  state: z2.string().length(2),
  zipCode: z2.string().length(8),
  country: z2.string().default("BR")
});
function isPagarmeConfigured() {
  return !!PAGARME_API_KEY;
}
async function pagarmeRequest(endpoint, method = "GET", body) {
  if (!PAGARME_API_KEY) {
    throw new Error("Pagar.me API key not configured");
  }
  const response = await fetch(`${PAGARME_API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${PAGARME_API_KEY}:`).toString("base64")}`
    },
    body: body ? JSON.stringify(body) : void 0
  });
  const data = await response.json();
  if (!response.ok) {
    const error = data;
    throw new Error(error.message || "Pagar.me API error");
  }
  return data;
}
async function createPixPayment(params) {
  if (!isPagarmeConfigured()) {
    console.warn("[Pagar.me] Running in simulation mode - no API key configured");
    return {
      success: true,
      transactionId: `sim_pix_${Date.now()}`,
      status: "pending",
      message: "PIX simulado - ambiente de desenvolvimento",
      pixQrCode: "00020126580014br.gov.bcb.pix0136exemplo-pix-simulado",
      pixQrCodeUrl: "https://via.placeholder.com/200x200?text=QR+Code+PIX"
    };
  }
  try {
    const response = await pagarmeRequest("/orders", "POST", {
      items: [
        {
          amount: params.amountCents,
          description: `Pedido #${params.orderId}`,
          quantity: 1,
          code: params.orderId
        }
      ],
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        document: params.customer.document,
        type: params.customer.document.length > 11 ? "company" : "individual"
      },
      payments: [
        {
          payment_method: "pix",
          pix: {
            expires_in: (params.expiresInMinutes || 30) * 60
            // Convert to seconds
          }
        }
      ]
    });
    const pixCharge = response.charges?.[0]?.last_transaction;
    return {
      success: true,
      transactionId: response.id,
      status: "pending",
      message: "PIX gerado com sucesso",
      pixQrCode: pixCharge?.qr_code,
      pixQrCodeUrl: pixCharge?.qr_code_url
    };
  } catch (error) {
    console.error("[Pagar.me] PIX payment error:", error);
    return {
      success: false,
      status: "refused",
      message: error instanceof Error ? error.message : "Erro ao gerar PIX"
    };
  }
}
async function createBoletoPayment(params) {
  if (!isPagarmeConfigured()) {
    const dueDate = /* @__PURE__ */ new Date();
    dueDate.setDate(dueDate.getDate() + (params.dueDays || 3));
    console.warn("[Pagar.me] Running in simulation mode - no API key configured");
    return {
      success: true,
      transactionId: `sim_boleto_${Date.now()}`,
      status: "pending",
      message: "Boleto simulado - ambiente de desenvolvimento",
      boletoUrl: "https://via.placeholder.com/800x400?text=Boleto+Simulado",
      boletoBarcode: "23793.38128 60000.000003 00000.000400 1 84340000012345",
      boletoDueDate: dueDate.toISOString()
    };
  }
  try {
    const dueDate = /* @__PURE__ */ new Date();
    dueDate.setDate(dueDate.getDate() + (params.dueDays || 3));
    const response = await pagarmeRequest("/orders", "POST", {
      items: [
        {
          amount: params.amountCents,
          description: `Pedido #${params.orderId}`,
          quantity: 1,
          code: params.orderId
        }
      ],
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        document: params.customer.document,
        type: params.customer.document.length > 11 ? "company" : "individual",
        address: {
          line_1: `${params.billingAddress.number}, ${params.billingAddress.street}`,
          line_2: params.billingAddress.complement,
          zip_code: params.billingAddress.zipCode,
          city: params.billingAddress.city,
          state: params.billingAddress.state,
          country: params.billingAddress.country
        }
      },
      payments: [
        {
          payment_method: "boleto",
          boleto: {
            due_at: dueDate.toISOString(),
            instructions: "N\xE3o receber ap\xF3s o vencimento"
          }
        }
      ]
    });
    const boletoCharge = response.charges?.[0]?.last_transaction;
    return {
      success: true,
      transactionId: response.id,
      status: "pending",
      message: "Boleto gerado com sucesso",
      boletoUrl: boletoCharge?.pdf,
      boletoBarcode: boletoCharge?.line,
      boletoDueDate: boletoCharge?.due_at
    };
  } catch (error) {
    console.error("[Pagar.me] Boleto payment error:", error);
    return {
      success: false,
      status: "refused",
      message: error instanceof Error ? error.message : "Erro ao gerar boleto"
    };
  }
}

// server/services/email.ts
var RESEND_API_KEY = process.env.RESEND_API_KEY;
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
var EMAIL_FROM = process.env.EMAIL_FROM || "noreply@hayahlivros.com.br";
var EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Hayah Livros";
async function sendEmail(options) {
  if (RESEND_API_KEY) {
    return sendWithResend(options);
  }
  if (SENDGRID_API_KEY) {
    return sendWithSendGrid(options);
  }
  console.log("[Email] No provider configured. Email would be sent:");
  console.log(`  To: ${options.to}`);
  console.log(`  Subject: ${options.subject}`);
  console.log(`  Content: ${options.text || options.html.substring(0, 100)}...`);
  return {
    success: true,
    messageId: `dev_${Date.now()}`
  };
}
async function sendWithResend(options) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }
    return {
      success: true,
      messageId: data.id
    };
  } catch (error) {
    console.error("[Email] Resend error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email"
    };
  }
}
async function sendWithSendGrid(options) {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
        subject: options.subject,
        content: [
          { type: "text/plain", value: options.text || options.html.replace(/<[^>]*>/g, "") },
          { type: "text/html", value: options.html }
        ],
        reply_to: options.replyTo ? { email: options.replyTo } : void 0
      })
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.errors?.[0]?.message || "Failed to send email");
    }
    return {
      success: true,
      messageId: response.headers.get("x-message-id") || `sg_${Date.now()}`
    };
  } catch (error) {
    console.error("[Email] SendGrid error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email"
    };
  }
}
function orderConfirmationEmail(data) {
  const formatPrice = (cents) => `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
  const itemsHtml = data.items.map(
    (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.priceCents)}</td>
      </tr>
    `
  ).join("");
  const itemsText = data.items.map((item) => `  - ${item.name} x${item.quantity}: ${formatPrice(item.priceCents)}`).join("\n");
  const paymentMethodLabel = {
    credit_card: "Cart\xE3o de Cr\xE9dito",
    pix: "PIX",
    boleto: "Boleto Banc\xE1rio"
  };
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hayah Livros</h1>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="color: #333; margin-top: 0;">Pedido Confirmado!</h2>

      <p style="color: #666; line-height: 1.6;">
        Ol\xE1 <strong>${data.customerName}</strong>,
      </p>

      <p style="color: #666; line-height: 1.6;">
        Recebemos seu pedido <strong>#${data.orderId}</strong> e ele est\xE1 sendo processado.
      </p>

      <!-- Order Items -->
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <thead>
          <tr style="background-color: #f8f8f8;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ec4899;">Produto</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ec4899;">Qtd</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ec4899;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px; text-align: right;">Subtotal:</td>
            <td style="padding: 12px; text-align: right;">${formatPrice(data.subtotalCents)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 12px; text-align: right;">Frete:</td>
            <td style="padding: 12px; text-align: right;">${formatPrice(data.shippingCents)}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 18px;">
            <td colspan="2" style="padding: 12px; text-align: right; color: #ec4899;">Total:</td>
            <td style="padding: 12px; text-align: right; color: #ec4899;">${formatPrice(data.totalCents)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Shipping Address -->
      <div style="background-color: #f8f8f8; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #333;">Endere\xE7o de Entrega</h3>
        <p style="color: #666; margin: 0; line-height: 1.6;">
          ${data.shippingAddress.street}, ${data.shippingAddress.number}
          ${data.shippingAddress.complement ? ` - ${data.shippingAddress.complement}` : ""}<br>
          ${data.shippingAddress.district}<br>
          ${data.shippingAddress.city} - ${data.shippingAddress.state}<br>
          CEP: ${data.shippingAddress.cep}
        </p>
      </div>

      <!-- Payment Method -->
      <p style="color: #666; line-height: 1.6;">
        <strong>Forma de Pagamento:</strong> ${paymentMethodLabel[data.paymentMethod] || data.paymentMethod}
      </p>

      <p style="color: #666; line-height: 1.6;">
        Voc\xEA receber\xE1 atualiza\xE7\xF5es sobre o status do seu pedido por e-mail.
      </p>

      <p style="color: #666; line-height: 1.6;">
        Obrigado por comprar com a gente!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #333; padding: 24px; text-align: center;">
      <p style="color: #999; margin: 0; font-size: 14px;">
        \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Hayah Livros. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `;
  const text = `
HAYAH LIVROS - Pedido Confirmado!

Ol\xE1 ${data.customerName},

Recebemos seu pedido #${data.orderId} e ele est\xE1 sendo processado.

ITENS DO PEDIDO:
${itemsText}

Subtotal: ${formatPrice(data.subtotalCents)}
Frete: ${formatPrice(data.shippingCents)}
Total: ${formatPrice(data.totalCents)}

ENDERE\xC7O DE ENTREGA:
${data.shippingAddress.street}, ${data.shippingAddress.number}${data.shippingAddress.complement ? ` - ${data.shippingAddress.complement}` : ""}
${data.shippingAddress.district}
${data.shippingAddress.city} - ${data.shippingAddress.state}
CEP: ${data.shippingAddress.cep}

Forma de Pagamento: ${paymentMethodLabel[data.paymentMethod] || data.paymentMethod}

Voc\xEA receber\xE1 atualiza\xE7\xF5es sobre o status do seu pedido por e-mail.

Obrigado por comprar com a gente!

---
Hayah Livros
  `;
  return {
    subject: `Pedido #${data.orderId} confirmado - Hayah Livros`,
    html,
    text
  };
}
function orderStatusUpdateEmail(data) {
  const statusLabels = {
    PAGO: {
      label: "Pagamento Confirmado",
      description: "Seu pagamento foi confirmado e seu pedido est\xE1 sendo preparado.",
      color: "#22c55e"
    },
    EM_SEPARACAO: {
      label: "Em Separa\xE7\xE3o",
      description: "Seu pedido est\xE1 sendo preparado para envio.",
      color: "#3b82f6"
    },
    POSTADO: {
      label: "Enviado",
      description: "Seu pedido foi enviado e est\xE1 a caminho!",
      color: "#8b5cf6"
    },
    EM_TRANSITO: {
      label: "Em Tr\xE2nsito",
      description: "Seu pedido est\xE1 a caminho do destino.",
      color: "#f59e0b"
    },
    ENTREGUE: {
      label: "Entregue",
      description: "Seu pedido foi entregue. Esperamos que voc\xEA aproveite!",
      color: "#22c55e"
    },
    CANCELADO: {
      label: "Cancelado",
      description: "Seu pedido foi cancelado.",
      color: "#ef4444"
    }
  };
  const statusInfo = statusLabels[data.status] || {
    label: data.status,
    description: "O status do seu pedido foi atualizado.",
    color: "#666"
  };
  const trackingSection = data.trackingCode && data.trackingUrl ? `
      <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af;">Rastreamento</h3>
        <p style="color: #666; margin: 0;">
          C\xF3digo: <strong>${data.trackingCode}</strong><br>
          <a href="${data.trackingUrl}" style="color: #3b82f6;">Clique aqui para rastrear seu pedido</a>
        </p>
      </div>
    ` : "";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hayah Livros</h1>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="color: #333; margin-top: 0;">Atualiza\xE7\xE3o do Pedido #${data.orderId}</h2>

      <p style="color: #666; line-height: 1.6;">
        Ol\xE1 <strong>${data.customerName}</strong>,
      </p>

      <div style="background-color: ${statusInfo.color}15; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid ${statusInfo.color};">
        <h3 style="margin-top: 0; color: ${statusInfo.color};">${statusInfo.label}</h3>
        <p style="color: #666; margin: 0;">${statusInfo.description}</p>
      </div>

      ${trackingSection}

      <p style="color: #666; line-height: 1.6;">
        Se tiver alguma d\xFAvida, entre em contato conosco.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #333; padding: 24px; text-align: center;">
      <p style="color: #999; margin: 0; font-size: 14px;">
        \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Hayah Livros. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `;
  const text = `
HAYAH LIVROS - Atualiza\xE7\xE3o do Pedido #${data.orderId}

Ol\xE1 ${data.customerName},

${statusInfo.label}
${statusInfo.description}

${data.trackingCode ? `C\xF3digo de rastreamento: ${data.trackingCode}` : ""}
${data.trackingUrl ? `Link de rastreamento: ${data.trackingUrl}` : ""}

Se tiver alguma d\xFAvida, entre em contato conosco.

---
Hayah Livros
  `;
  return {
    subject: `Pedido #${data.orderId} - ${statusInfo.label}`,
    html,
    text
  };
}

// server/services/melhor-envio.ts
var MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
var MELHOR_ENVIO_URL = process.env.MELHOR_ENVIO_URL || "https://sandbox.melhorenvio.com.br";
var MELHOR_ENVIO_FROM_CEP = process.env.MELHOR_ENVIO_FROM_CEP;
var MELHOR_ENVIO_EMAIL = process.env.MELHOR_ENVIO_EMAIL;
async function calculateShipping(params) {
  if (!MELHOR_ENVIO_TOKEN || !MELHOR_ENVIO_FROM_CEP) {
    console.warn("[Melhor Envio] Credentials not configured. Returning empty options.");
    return [];
  }
  try {
    const response = await fetch(`${MELHOR_ENVIO_URL}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${MELHOR_ENVIO_TOKEN}`,
        "User-Agent": MELHOR_ENVIO_EMAIL || "contact@hayahlivros.com.br"
      },
      body: JSON.stringify({
        from: {
          postal_code: MELHOR_ENVIO_FROM_CEP
        },
        to: {
          postal_code: params.to_postal_code
        },
        products: params.items.map((item) => ({
          id: item.id,
          width: item.width,
          height: item.height,
          length: item.length,
          weight: item.weight,
          insurance_value: item.insurance_value,
          quantity: item.quantity
        }))
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Melhor Envio] API Error:", JSON.stringify(errorData, null, 2));
      throw new Error(`Melhor Envio API error: ${response.statusText}`);
    }
    const data = await response.json();
    const validOptions = (Array.isArray(data) ? data : []).filter((opt) => !opt.error);
    return validOptions;
  } catch (error) {
    console.error("[Melhor Envio] Calculation error:", error);
    throw error;
  }
}

// server/routers-products.ts
var productsRouter = router({
  list: publicProcedure.query(async () => {
    return await getActiveProducts();
  }),
  getBySlug: publicProcedure.input(z3.object({ slug: z3.string() })).query(async ({ input }) => {
    return await getProductBySlug(input.slug);
  }),
  // Creator endpoints
  myProducts: protectedProcedure.query(async ({ ctx }) => {
    return await getCreatorProducts(ctx.user.id);
  }),
  create: protectedProcedure.input(z3.object({
    productType: z3.enum(["physical", "digital"]),
    name: z3.string().min(1).max(255),
    description: z3.string().optional(),
    priceCents: z3.number().min(0),
    compareAtPriceCents: z3.number().min(0).optional(),
    imageUrl: z3.string().optional(),
    // Physical fields
    stockQuantity: z3.number().min(0).optional(),
    weightGrams: z3.number().min(0).optional(),
    widthCm: z3.number().min(0).optional(),
    heightCm: z3.number().min(0).optional(),
    depthCm: z3.number().min(0).optional(),
    // Digital fields
    fileUrl: z3.string().optional(),
    fileType: z3.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const slug = input.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 200);
    return await createProduct({
      creatorId: ctx.user.id,
      slug,
      productType: input.productType,
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      compareAtPriceCents: input.compareAtPriceCents,
      imageUrl: input.imageUrl,
      stockQuantity: input.stockQuantity,
      weightGrams: input.weightGrams,
      widthCm: input.widthCm?.toString(),
      heightCm: input.heightCm?.toString(),
      depthCm: input.depthCm?.toString(),
      fileUrl: input.fileUrl,
      fileType: input.fileType
    });
  }),
  update: protectedProcedure.input(z3.object({
    productId: z3.number(),
    name: z3.string().min(1).max(255).optional(),
    description: z3.string().optional(),
    priceCents: z3.number().min(0).optional(),
    compareAtPriceCents: z3.number().min(0).optional(),
    imageUrl: z3.string().optional(),
    // Physical fields
    stockQuantity: z3.number().min(0).optional(),
    weightGrams: z3.number().min(0).optional(),
    widthCm: z3.number().min(0).optional(),
    heightCm: z3.number().min(0).optional(),
    depthCm: z3.number().min(0).optional(),
    // Digital fields
    fileUrl: z3.string().optional(),
    fileType: z3.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const { productId, ...updates } = input;
    return await updateProduct(productId, ctx.user.id, {
      ...updates,
      widthCm: updates.widthCm?.toString(),
      heightCm: updates.heightCm?.toString(),
      depthCm: updates.depthCm?.toString()
    });
  }),
  delete: protectedProcedure.input(z3.object({ productId: z3.number() })).mutation(async ({ input, ctx }) => {
    await deleteCreatorProduct(input.productId, ctx.user.id);
    return { success: true };
  }),
  toggleActive: protectedProcedure.input(z3.object({ productId: z3.number() })).mutation(async ({ input, ctx }) => {
    return await toggleProductActive(input.productId, ctx.user.id);
  })
});
var checkoutRouter = router({
  calculateShipping: publicProcedure.input(z3.object({
    cep: z3.string(),
    productId: z3.number(),
    quantity: z3.number()
  })).mutation(async ({ input }) => {
    const product = await getProductById(input.productId);
    if (!product) {
      throw new Error("Produto n\xE3o encontrado");
    }
    if (product.productType === "digital") {
      return {
        options: [],
        message: "Produto digital n\xE3o requer frete"
      };
    }
    const getFallbackShippingOptions = () => {
      const basePrice = 15.9 + (input.quantity - 1) * 3;
      const expressPrice = 25.9 + (input.quantity - 1) * 5;
      return {
        options: [
          {
            id: "pac",
            code: "pac",
            name: "PAC - Correios",
            price: basePrice.toFixed(2),
            priceCents: Math.round(basePrice * 100),
            delivery_time: 12,
            deliveryDays: 12
          },
          {
            id: "sedex",
            code: "sedex",
            name: "SEDEX - Correios",
            price: expressPrice.toFixed(2),
            priceCents: Math.round(expressPrice * 100),
            delivery_time: 5,
            deliveryDays: 5
          }
        ]
      };
    };
    try {
      const shippingOptions = await calculateShipping({
        to_postal_code: input.cep,
        items: [{
          id: String(product.id),
          width: Number(product.widthCm),
          height: Number(product.heightCm),
          length: Number(product.depthCm),
          weight: (product.weightGrams ?? 300) / 1e3,
          // Convert to kg
          insurance_value: product.priceCents / 100,
          // Convert to BRL
          quantity: input.quantity
        }]
      });
      if (!shippingOptions || shippingOptions.length === 0) {
        console.log("[Shipping] Using fallback shipping options");
        return getFallbackShippingOptions();
      }
      return {
        options: shippingOptions.map((opt) => ({
          id: String(opt.id),
          code: String(opt.id),
          name: opt.company.name + " - " + opt.name,
          price: opt.custom_price,
          priceCents: Math.round(parseFloat(opt.custom_price) * 100),
          delivery_time: opt.custom_delivery_time,
          deliveryDays: opt.custom_delivery_time
        }))
      };
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      console.log("[Shipping] API error, using fallback shipping options");
      return getFallbackShippingOptions();
    }
  }),
  createOrder: protectedProcedure.input(z3.object({
    productId: z3.number(),
    quantity: z3.number(),
    shippingMethod: z3.string(),
    shippingPriceCents: z3.number(),
    address: z3.object({
      recipientName: z3.string(),
      cep: z3.string(),
      street: z3.string(),
      number: z3.string(),
      complement: z3.string().optional(),
      district: z3.string(),
      city: z3.string(),
      state: z3.string()
    }),
    paymentMethod: z3.enum(["credit_card", "pix", "boleto"]),
    customerNotes: z3.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const product = await getProductById(input.productId);
    if (!product) {
      throw new Error("Produto n\xE3o encontrado");
    }
    if (!product.active) {
      throw new Error("Produto n\xE3o dispon\xEDvel para venda");
    }
    await decrementProductStock(product.id, input.quantity);
    const subtotalCents = product.priceCents * input.quantity;
    const totalCents = subtotalCents + input.shippingPriceCents;
    const addressId = await createAddress({
      userId: ctx.user.id,
      ...input.address,
      isDefault: false
    });
    const orderId = await createOrder({
      userId: ctx.user.id,
      addressId,
      subtotalCents,
      shippingPriceCents: input.shippingPriceCents,
      discountCents: 0,
      totalCents,
      status: "AGUARDANDO_PAGAMENTO",
      paymentMethod: input.paymentMethod,
      shippingAddress: input.address,
      customerNotes: input.customerNotes || null,
      adminNotes: null,
      paidAt: null,
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null
    });
    await createOrderItems([{
      orderId,
      productId: product.id,
      quantity: input.quantity,
      unitPriceCents: product.priceCents,
      totalPriceCents: subtotalCents,
      productName: product.name
    }]);
    let paymentResult = null;
    const customer = {
      name: input.address.recipientName,
      email: ctx.user.email || "",
      document: ctx.user.cpf || ""
    };
    const billingAddress = {
      street: input.address.street,
      number: input.address.number,
      complement: input.address.complement,
      neighborhood: input.address.district,
      city: input.address.city,
      state: input.address.state,
      zipCode: input.address.cep.replace(/\D/g, ""),
      country: "BR"
    };
    if (input.paymentMethod === "pix") {
      paymentResult = await createPixPayment({
        amountCents: totalCents,
        customer,
        orderId: String(orderId)
      });
    } else if (input.paymentMethod === "boleto") {
      paymentResult = await createBoletoPayment({
        amountCents: totalCents,
        customer,
        billingAddress,
        orderId: String(orderId)
      });
    }
    if (ctx.user.email) {
      const emailContent = orderConfirmationEmail({
        customerName: input.address.recipientName,
        orderId,
        items: [{
          name: product.name,
          quantity: input.quantity,
          priceCents: product.priceCents * input.quantity
        }],
        subtotalCents,
        shippingCents: input.shippingPriceCents,
        totalCents,
        shippingAddress: input.address,
        paymentMethod: input.paymentMethod
      });
      sendEmail({
        to: ctx.user.email,
        ...emailContent
      }).catch((err) => {
        console.error("[Email] Failed to send order confirmation:", err);
      });
    }
    return {
      orderId,
      totalCents,
      payment: paymentResult
    };
  })
});
var ordersRouter = router({
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return await getUserOrders(ctx.user.id);
  }),
  getById: protectedProcedure.input(z3.object({ id: z3.number() })).query(async ({ input, ctx }) => {
    const order = await getOrderById(input.id);
    if (!order || order.userId !== ctx.user.id) {
      throw new Error("Pedido n\xE3o encontrado");
    }
    const items = await getOrderItems(input.id);
    return {
      ...order,
      items
    };
  }),
  // Get order with tracking information
  getWithTracking: protectedProcedure.input(z3.object({ id: z3.number() })).query(async ({ input, ctx }) => {
    const orderData = await getOrderWithTracking(input.id, ctx.user.id);
    if (!orderData) {
      throw new Error("Pedido n\xE3o encontrado");
    }
    let trackingInfo = null;
    if (orderData.shipment?.trackingCode) {
      trackingInfo = await trackShipment(orderData.shipment.trackingCode);
    }
    return {
      ...orderData,
      tracking: trackingInfo
    };
  })
});
var profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await getUserById(ctx.user.id);
  }),
  update: protectedProcedure.input(z3.object({
    name: z3.string().min(2).optional(),
    phone: z3.string().optional(),
    cpf: z3.string().length(11).optional()
  })).mutation(async ({ input, ctx }) => {
    await updateUserProfile(ctx.user.id, input);
    return { success: true };
  })
});
var addressRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getUserAddresses(ctx.user.id);
  }),
  create: protectedProcedure.input(z3.object({
    recipientName: z3.string(),
    cep: z3.string(),
    street: z3.string(),
    number: z3.string(),
    complement: z3.string().optional(),
    district: z3.string(),
    city: z3.string(),
    state: z3.string().length(2),
    isDefault: z3.boolean().optional()
  })).mutation(async ({ input, ctx }) => {
    const addressId = await createAddress({
      userId: ctx.user.id,
      ...input,
      isDefault: input.isDefault ?? false
    });
    return { success: true, addressId };
  }),
  update: protectedProcedure.input(z3.object({
    addressId: z3.number(),
    recipientName: z3.string().optional(),
    cep: z3.string().optional(),
    street: z3.string().optional(),
    number: z3.string().optional(),
    complement: z3.string().optional(),
    district: z3.string().optional(),
    city: z3.string().optional(),
    state: z3.string().length(2).optional(),
    isDefault: z3.boolean().optional()
  })).mutation(async ({ input, ctx }) => {
    const { addressId, ...data } = input;
    await updateAddress(addressId, ctx.user.id, data);
    return { success: true };
  }),
  delete: protectedProcedure.input(z3.object({ addressId: z3.number() })).mutation(async ({ input, ctx }) => {
    await deleteAddress(input.addressId, ctx.user.id);
    return { success: true };
  })
});

// server/routers-admin.ts
import { z as z4 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/db-admin.ts
async function getAllOrders() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("orders").select("*").order("createdAt", { ascending: false });
  if (error) {
    console.error("[Database] Error fetching all orders:", error);
    return [];
  }
  return data || [];
}
async function updateOrderStatus(orderId, status) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const updateData = {
    status,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (status === "PAGO") {
    updateData.paidAt = (/* @__PURE__ */ new Date()).toISOString();
  } else if (status === "POSTADO") {
    updateData.shippedAt = (/* @__PURE__ */ new Date()).toISOString();
  } else if (status === "ENTREGUE") {
    updateData.deliveredAt = (/* @__PURE__ */ new Date()).toISOString();
  } else if (status === "CANCELADO") {
    updateData.cancelledAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  const { error } = await supabaseAdmin.from("orders").update(updateData).eq("id", orderId);
  if (error) {
    console.error("[Database] Error updating order status:", error);
    throw error;
  }
}
async function updateOrderAdminNotes(orderId, adminNotes) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("orders").update({
    adminNotes,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", orderId);
  if (error) {
    console.error("[Database] Error updating order admin notes:", error);
    throw error;
  }
}
async function getAllUsers() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("users").select("*").order("createdAt", { ascending: false });
  if (error) {
    console.error("[Database] Error fetching all users:", error);
    return [];
  }
  return data || [];
}
async function updateUser(userId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("users").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", userId);
  if (error) {
    console.error("[Database] Error updating user:", error);
    throw error;
  }
}
async function getOrderWithUser(orderId) {
  if (!supabaseAdmin) return null;
  const { data: order, error: orderError } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).single();
  if (orderError || !order) return null;
  const { data: user } = await supabaseAdmin.from("users").select("*").eq("id", order.userId).single();
  const { data: items } = await supabaseAdmin.from("orderItems").select("*").eq("orderId", orderId);
  return {
    ...order,
    user: user || null,
    items: items || []
  };
}
async function getShipmentByOrderId(orderId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("shipments").select("*").eq("orderId", orderId).single();
  if (error) return null;
  return data;
}
async function updateShipmentTracking(orderId, trackingCode, trackingUrl) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const existing = await getShipmentByOrderId(orderId);
  if (existing) {
    const { error } = await supabaseAdmin.from("shipments").update({
      trackingCode,
      trackingUrl,
      status: "ETIQUETA_GERADA",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("orderId", orderId);
    if (error) {
      console.error("[Database] Error updating shipment tracking:", error);
      throw error;
    }
  } else {
    const { data: order, error: orderError } = await supabaseAdmin.from("orders").select("shippingPriceCents").eq("id", orderId).single();
    if (orderError || !order) throw new Error("Order not found");
    const { error } = await supabaseAdmin.from("shipments").insert({
      orderId,
      shippingMethod: "PAC",
      shippingPriceCents: order.shippingPriceCents,
      trackingCode,
      trackingUrl,
      status: "ETIQUETA_GERADA",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (error) {
      console.error("[Database] Error creating shipment with tracking:", error);
      throw error;
    }
  }
}
async function updateShipmentStatus(orderId, status) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const updateData = {
    status,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (status === "POSTADO") {
    updateData.postedAt = (/* @__PURE__ */ new Date()).toISOString();
  } else if (status === "ENTREGUE") {
    updateData.deliveredAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  const { error } = await supabaseAdmin.from("shipments").update(updateData).eq("orderId", orderId);
  if (error) {
    console.error("[Database] Error updating shipment status:", error);
    throw error;
  }
}
async function getAllProducts() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("products").select("*").order("createdAt", { ascending: false });
  if (error) {
    console.error("[Database] Error fetching all products:", error);
    return [];
  }
  return data || [];
}
async function updateProductStock(productId, quantity) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("products").update({
    stockQuantity: quantity,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", productId);
  if (error) {
    console.error("[Database] Error updating product stock:", error);
    throw error;
  }
}
async function updateProduct2(productId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("products").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", productId);
  if (error) {
    console.error("[Database] Error updating product:", error);
    throw error;
  }
}
async function createProduct2(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("products").insert({
    ...data,
    active: true,
    productType: "physical",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating product:", error);
    throw error;
  }
  return result.id;
}
async function deleteProduct(productId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("products").delete().eq("id", productId);
  if (error) {
    console.error("[Database] Error deleting product:", error);
    throw error;
  }
}
async function getAllPosts() {
  if (!supabaseAdmin) return [];
  const { data: posts, error } = await supabaseAdmin.from("posts").select("id, content, createdAt, creatorId").order("createdAt", { ascending: false });
  if (error || !posts) return [];
  const creatorIds = [...new Set(posts.map((p) => p.creatorId))];
  const { data: creators } = await supabaseAdmin.from("creatorProfiles").select("id, displayName").in("id", creatorIds);
  const creatorsMap = new Map((creators || []).map((c) => [c.id, c]));
  return posts.map((post) => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    creatorName: creatorsMap.get(post.creatorId)?.displayName || null,
    creatorId: post.creatorId
  }));
}
async function adminDeletePost(postId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  await supabaseAdmin.from("postMedia").delete().eq("postId", postId);
  await supabaseAdmin.from("postLikes").delete().eq("postId", postId);
  const { data: comments } = await supabaseAdmin.from("postComments").select("id").eq("postId", postId);
  if (comments && comments.length > 0) {
    const commentIds = comments.map((c) => c.id);
    await supabaseAdmin.from("commentLikes").delete().in("commentId", commentIds);
  }
  await supabaseAdmin.from("postComments").delete().eq("postId", postId);
  const { error } = await supabaseAdmin.from("posts").delete().eq("id", postId);
  if (error) {
    console.error("[Database] Error deleting post:", error);
    throw error;
  }
}
async function getAllComments() {
  if (!supabaseAdmin) return [];
  const { data: comments, error } = await supabaseAdmin.from("postComments").select("id, content, createdAt, postId, userId").order("createdAt", { ascending: false });
  if (error || !comments) return [];
  const userIds = [...new Set(comments.map((c) => c.userId))];
  const { data: users } = await supabaseAdmin.from("users").select("id, name").in("id", userIds);
  const usersMap = new Map((users || []).map((u) => [u.id, u]));
  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    postId: comment.postId,
    userName: usersMap.get(comment.userId)?.name || null,
    userId: comment.userId
  }));
}
async function adminDeleteComment(commentId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  await supabaseAdmin.from("commentLikes").delete().eq("commentId", commentId);
  const { error } = await supabaseAdmin.from("postComments").delete().eq("id", commentId);
  if (error) {
    console.error("[Database] Error deleting comment:", error);
    throw error;
  }
}
async function getAllCourses() {
  if (!supabaseAdmin) return [];
  const { data: courses, error } = await supabaseAdmin.from("courses").select("*").order("createdAt", { ascending: false });
  if (error || !courses) return [];
  const creatorIds = [...new Set(courses.map((c) => c.creatorId))];
  const { data: creators } = await supabaseAdmin.from("creatorProfiles").select("id, displayName").in("id", creatorIds);
  const creatorsMap = new Map((creators || []).map((c) => [c.id, c]));
  return courses.map((course) => ({
    course,
    creator: creatorsMap.get(course.creatorId) || { id: course.creatorId, displayName: null }
  }));
}
async function getAllDigitalProducts() {
  if (!supabaseAdmin) return [];
  const { data: products, error } = await supabaseAdmin.from("digitalProducts").select("*").order("createdAt", { ascending: false });
  if (error || !products) return [];
  const creatorIds = [...new Set(products.map((p) => p.creatorId))];
  const { data: creators } = await supabaseAdmin.from("creatorProfiles").select("id, displayName").in("id", creatorIds);
  const creatorsMap = new Map((creators || []).map((c) => [c.id, c]));
  return products.map((product) => ({
    product,
    creator: creatorsMap.get(product.creatorId) || { id: product.creatorId, displayName: null }
  }));
}

// server/routers-admin.ts
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({
      code: "FORBIDDEN",
      message: "Acesso negado. Apenas administradores podem acessar esta funcionalidade."
    });
  }
  return next({ ctx });
});
var adminRouter = router({
  orders: router({
    list: adminProcedure2.query(async () => {
      return await getAllOrders();
    }),
    getById: adminProcedure2.input(z4.object({ id: z4.number() })).query(async ({ input }) => {
      return await getOrderWithUser(input.id);
    }),
    updateStatus: adminProcedure2.input(z4.object({
      orderId: z4.number(),
      status: z4.enum([
        "AGUARDANDO_PAGAMENTO",
        "PAGO",
        "EM_SEPARACAO",
        "POSTADO",
        "EM_TRANSITO",
        "ENTREGUE",
        "CANCELADO",
        "REEMBOLSADO"
      ])
    })).mutation(async ({ input }) => {
      await updateOrderStatus(input.orderId, input.status);
      return { success: true };
    }),
    updateNotes: adminProcedure2.input(z4.object({
      orderId: z4.number(),
      adminNotes: z4.string()
    })).mutation(async ({ input }) => {
      await updateOrderAdminNotes(input.orderId, input.adminNotes);
      return { success: true };
    })
  }),
  users: router({
    list: adminProcedure2.query(async () => {
      return await getAllUsers();
    }),
    update: adminProcedure2.input(z4.object({
      userId: z4.number(),
      role: z4.enum(["user", "admin"]).optional(),
      active: z4.boolean().optional()
    })).mutation(async ({ input }) => {
      const { userId, ...data } = input;
      await updateUser(userId, data);
      return { success: true };
    })
  }),
  // Shipment/Tracking Management
  shipments: router({
    getByOrderId: adminProcedure2.input(z4.object({ orderId: z4.number() })).query(async ({ input }) => {
      return await getShipmentByOrderId(input.orderId);
    }),
    addTracking: adminProcedure2.input(z4.object({
      orderId: z4.number(),
      trackingCode: z4.string().min(1)
    })).mutation(async ({ input }) => {
      const trackingUrl = getTrackingUrl(input.trackingCode);
      await updateShipmentTracking(input.orderId, input.trackingCode, trackingUrl);
      await updateOrderStatus(input.orderId, "POSTADO");
      const orderData = await getOrderWithUser(input.orderId);
      if (orderData?.user?.email) {
        const emailContent = orderStatusUpdateEmail({
          customerName: orderData.user.name || "Cliente",
          orderId: input.orderId,
          status: "POSTADO",
          trackingCode: input.trackingCode,
          trackingUrl
        });
        sendEmail({
          to: orderData.user.email,
          ...emailContent
        }).catch((err) => {
          console.error("[Email] Failed to send tracking notification:", err);
        });
      }
      return { success: true, trackingUrl };
    }),
    updateStatus: adminProcedure2.input(z4.object({
      orderId: z4.number(),
      status: z4.enum([
        "PENDENTE",
        "ETIQUETA_GERADA",
        "POSTADO",
        "EM_TRANSITO",
        "SAIU_PARA_ENTREGA",
        "ENTREGUE",
        "DEVOLVIDO"
      ])
    })).mutation(async ({ input }) => {
      await updateShipmentStatus(input.orderId, input.status);
      if (input.status === "ENTREGUE") {
        await updateOrderStatus(input.orderId, "ENTREGUE");
      }
      return { success: true };
    }),
    track: adminProcedure2.input(z4.object({ trackingCode: z4.string() })).query(async ({ input }) => {
      return await trackShipment(input.trackingCode);
    })
  }),
  // Product/Stock Management
  products: router({
    list: adminProcedure2.query(async () => {
      return await getAllProducts();
    }),
    updateStock: adminProcedure2.input(z4.object({
      productId: z4.number(),
      quantity: z4.number().min(0)
    })).mutation(async ({ input }) => {
      await updateProductStock(input.productId, input.quantity);
      return { success: true };
    }),
    update: adminProcedure2.input(z4.object({
      productId: z4.number(),
      name: z4.string().optional(),
      description: z4.string().optional(),
      priceCents: z4.number().optional(),
      compareAtPriceCents: z4.number().nullable().optional(),
      stockQuantity: z4.number().optional(),
      active: z4.boolean().optional(),
      imageUrl: z4.string().nullable().optional()
    })).mutation(async ({ input }) => {
      const { productId, ...data } = input;
      await updateProduct2(productId, data);
      return { success: true };
    }),
    create: adminProcedure2.input(z4.object({
      name: z4.string(),
      slug: z4.string(),
      description: z4.string().optional(),
      priceCents: z4.number(),
      compareAtPriceCents: z4.number().optional(),
      stockQuantity: z4.number().optional(),
      imageUrl: z4.string().optional()
    })).mutation(async ({ input }) => {
      const productId = await createProduct2(input);
      return { success: true, productId };
    }),
    delete: adminProcedure2.input(z4.object({ productId: z4.number() })).mutation(async ({ input }) => {
      await deleteProduct(input.productId);
      return { success: true };
    })
  }),
  // Social Moderation
  social: router({
    listPosts: adminProcedure2.query(async () => {
      return await getAllPosts();
    }),
    deletePost: adminProcedure2.input(z4.object({ postId: z4.number() })).mutation(async ({ input }) => {
      await adminDeletePost(input.postId);
      return { success: true };
    }),
    listComments: adminProcedure2.query(async () => {
      return await getAllComments();
    }),
    deleteComment: adminProcedure2.input(z4.object({ commentId: z4.number() })).mutation(async ({ input }) => {
      await adminDeleteComment(input.commentId);
      return { success: true };
    })
  }),
  // Marketplace Management (Admin View)
  courses: router({
    list: adminProcedure2.query(async () => {
      return await getAllCourses();
    })
  }),
  digitalProducts: router({
    list: adminProcedure2.query(async () => {
      return await getAllDigitalProducts();
    })
  })
});

// server/routers-social.ts
import { z as z5 } from "zod";

// server/db-social.ts
async function getCreatorProfileByUserId(userId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("creatorProfiles").select("*").eq("userId", userId).limit(1).single();
  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[Database] Error fetching creator profile:", error);
    }
    return null;
  }
  return data;
}
async function getCreatorProfileById(id) {
  if (!supabaseAdmin) return null;
  const { data: profile, error: profileError } = await supabaseAdmin.from("creatorProfiles").select("*").eq("id", id).single();
  if (profileError || !profile) return null;
  const { data: user } = await supabaseAdmin.from("users").select("id, name, email").eq("id", profile.userId).single();
  return {
    profile,
    user: user || { id: profile.userId, name: null, email: null }
  };
}
async function createCreatorProfile(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("creatorProfiles").insert({
    ...data,
    status: data.status || "pending",
    followersCount: 0,
    postsCount: 0,
    coursesCount: 0,
    isVerified: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating creator profile:", error);
    throw error;
  }
  return result.id;
}
async function updateCreatorProfile(userId, data) {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("creatorProfiles").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("userId", userId);
  if (error) {
    console.error("[Database] Error updating creator profile:", error);
  }
}
async function getApprovedCreators(limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];
  const { data: profiles, error } = await supabaseAdmin.from("creatorProfiles").select("*").eq("status", "approved").order("followersCount", { ascending: false }).range(offset, offset + limit - 1);
  if (error || !profiles) return [];
  const userIds = profiles.map((p) => p.userId);
  const { data: users } = await supabaseAdmin.from("users").select("id, name").in("id", userIds);
  const usersMap = new Map((users || []).map((u) => [u.id, u]));
  return profiles.map((profile) => ({
    profile,
    user: usersMap.get(profile.userId) || { id: profile.userId, name: null }
  }));
}
async function followUser(followerId, followingId) {
  if (!supabaseAdmin) return;
  const { error: insertError } = await supabaseAdmin.from("followers").insert({
    followerId,
    followingId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (insertError) {
    console.error("[Database] Error following user:", insertError);
    return;
  }
  const { data: profile } = await supabaseAdmin.from("creatorProfiles").select("followersCount").eq("userId", followingId).single();
  if (profile) {
    await supabaseAdmin.from("creatorProfiles").update({
      followersCount: (profile.followersCount || 0) + 1,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("userId", followingId);
  }
}
async function unfollowUser(followerId, followingId) {
  if (!supabaseAdmin) return;
  const { error: deleteError } = await supabaseAdmin.from("followers").delete().match({ followerId, followingId });
  if (deleteError) {
    console.error("[Database] Error unfollowing user:", deleteError);
    return;
  }
  const { data: profile } = await supabaseAdmin.from("creatorProfiles").select("followersCount").eq("userId", followingId).single();
  if (profile) {
    await supabaseAdmin.from("creatorProfiles").update({
      followersCount: Math.max((profile.followersCount || 0) - 1, 0),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("userId", followingId);
  }
}
async function isFollowing(followerId, followingId) {
  if (!supabaseAdmin) return false;
  const { data, error } = await supabaseAdmin.from("followers").select("id").match({ followerId, followingId }).limit(1).single();
  return !error && !!data;
}
async function getFollowers(userId, limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];
  const { data: followRecords, error } = await supabaseAdmin.from("followers").select("followerId, createdAt").eq("followingId", userId).order("createdAt", { ascending: false }).range(offset, offset + limit - 1);
  if (error || !followRecords) return [];
  const followerIds = followRecords.map((f) => f.followerId);
  const { data: users } = await supabaseAdmin.from("users").select("id, name").in("id", followerIds);
  const usersMap = new Map((users || []).map((u) => [u.id, u]));
  return followRecords.map((record) => ({
    id: usersMap.get(record.followerId)?.id || record.followerId,
    name: usersMap.get(record.followerId)?.name || null,
    followedAt: record.createdAt
  }));
}
async function getFollowing(userId, limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];
  const { data: followRecords, error } = await supabaseAdmin.from("followers").select("followingId, createdAt").eq("followerId", userId).order("createdAt", { ascending: false }).range(offset, offset + limit - 1);
  if (error || !followRecords) return [];
  const followingIds = followRecords.map((f) => f.followingId);
  const { data: users } = await supabaseAdmin.from("users").select("id, name").in("id", followingIds);
  const { data: profiles } = await supabaseAdmin.from("creatorProfiles").select("*").in("userId", followingIds);
  const usersMap = new Map((users || []).map((u) => [u.id, u]));
  const profilesMap = new Map((profiles || []).map((p) => [p.userId, p]));
  return followRecords.map((record) => ({
    profile: profilesMap.get(record.followingId) || null,
    user: usersMap.get(record.followingId) || { id: record.followingId, name: null },
    followedAt: record.createdAt
  }));
}
async function createPost(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("posts").insert({
    ...data,
    visibility: data.visibility || "public",
    isPinned: data.isPinned || false,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating post:", error);
    throw error;
  }
  const { data: profile } = await supabaseAdmin.from("creatorProfiles").select("postsCount").eq("id", data.creatorId).single();
  if (profile) {
    await supabaseAdmin.from("creatorProfiles").update({
      postsCount: (profile.postsCount || 0) + 1,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", data.creatorId);
  }
  return result.id;
}
async function addPostMedia(data) {
  if (data.length === 0) return;
  if (!supabaseAdmin) return;
  const mediaWithTimestamp = data.map((item) => ({
    ...item,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }));
  const { error } = await supabaseAdmin.from("postMedia").insert(mediaWithTimestamp);
  if (error) {
    console.error("[Database] Error adding post media:", error);
  }
}
async function getPostById(postId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("posts").select("*").eq("id", postId).single();
  if (error) return null;
  return data;
}
async function getPostWithDetails(postId, currentUserId) {
  if (!supabaseAdmin) return null;
  const { data: post, error: postError } = await supabaseAdmin.from("posts").select("*").eq("id", postId).single();
  if (postError || !post) return null;
  const { data: creator } = await supabaseAdmin.from("creatorProfiles").select("id, displayName, avatarUrl, userId").eq("id", post.creatorId).single();
  const { data: media } = await supabaseAdmin.from("postMedia").select("*").eq("postId", postId).order("orderIndex", { ascending: true });
  let isLiked = false;
  if (currentUserId) {
    const { data: like } = await supabaseAdmin.from("postLikes").select("id").match({ postId, userId: currentUserId }).single();
    isLiked = !!like;
  }
  return {
    post,
    creator: creator || { id: post.creatorId, displayName: "Unknown", avatarUrl: null, userId: 0 },
    media: media || [],
    isLiked
  };
}
async function getFeedPosts(currentUserId, limit = 20, offset = 0, feedType = "all") {
  if (!supabaseAdmin) return [];
  let creatorIds = [];
  if (feedType === "following") {
    const { data: following } = await supabaseAdmin.from("followers").select("followingId").eq("followerId", currentUserId);
    if (!following || following.length === 0) return [];
    const followedUserIds = following.map((f) => f.followingId);
    const { data: profiles } = await supabaseAdmin.from("creatorProfiles").select("id").in("userId", followedUserIds);
    if (!profiles || profiles.length === 0) return [];
    creatorIds = profiles.map((p) => p.id);
  }
  let query = supabaseAdmin.from("posts").select("*").eq("visibility", "public").order("createdAt", { ascending: false }).range(offset, offset + limit - 1);
  if (feedType === "following" && creatorIds.length > 0) {
    query = query.in("creatorId", creatorIds);
  }
  const { data: posts, error } = await query;
  if (error || !posts) return [];
  const postCreatorIds = [...new Set(posts.map((p) => p.creatorId))];
  const { data: creators } = await supabaseAdmin.from("creatorProfiles").select("id, displayName, avatarUrl, userId").in("id", postCreatorIds);
  const creatorsMap = new Map((creators || []).map((c) => [c.id, c]));
  const postIds = posts.map((p) => p.id);
  const { data: allMedia } = await supabaseAdmin.from("postMedia").select("*").in("postId", postIds).order("orderIndex", { ascending: true });
  const mediaByPost = /* @__PURE__ */ new Map();
  (allMedia || []).forEach((m) => {
    const existing = mediaByPost.get(m.postId) || [];
    existing.push(m);
    mediaByPost.set(m.postId, existing);
  });
  const { data: likes } = await supabaseAdmin.from("postLikes").select("postId").eq("userId", currentUserId).in("postId", postIds);
  const likedPostIds = new Set((likes || []).map((l) => l.postId));
  return posts.map((post) => ({
    post,
    creator: creatorsMap.get(post.creatorId) || { id: post.creatorId, displayName: "Unknown", avatarUrl: null, userId: 0 },
    media: mediaByPost.get(post.id) || [],
    isLiked: likedPostIds.has(post.id)
  }));
}
async function getCreatorPosts(creatorId, currentUserId, limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];
  const { data: posts, error } = await supabaseAdmin.from("posts").select("*").eq("creatorId", creatorId).order("isPinned", { ascending: false }).order("createdAt", { ascending: false }).range(offset, offset + limit - 1);
  if (error || !posts) return [];
  const { data: creator } = await supabaseAdmin.from("creatorProfiles").select("id, displayName, avatarUrl, userId").eq("id", creatorId).single();
  const postIds = posts.map((p) => p.id);
  const { data: allMedia } = await supabaseAdmin.from("postMedia").select("*").in("postId", postIds).order("orderIndex", { ascending: true });
  const mediaByPost = /* @__PURE__ */ new Map();
  (allMedia || []).forEach((m) => {
    const existing = mediaByPost.get(m.postId) || [];
    existing.push(m);
    mediaByPost.set(m.postId, existing);
  });
  let likedPostIds = /* @__PURE__ */ new Set();
  if (currentUserId) {
    const { data: likes } = await supabaseAdmin.from("postLikes").select("postId").eq("userId", currentUserId).in("postId", postIds);
    likedPostIds = new Set((likes || []).map((l) => l.postId));
  }
  return posts.map((post) => ({
    post,
    creator: creator || { id: creatorId, displayName: "Unknown", avatarUrl: null, userId: 0 },
    media: mediaByPost.get(post.id) || [],
    isLiked: likedPostIds.has(post.id)
  }));
}
async function deletePost(postId, creatorId) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("postMedia").delete().eq("postId", postId);
  await supabaseAdmin.from("postLikes").delete().eq("postId", postId);
  const { data: comments } = await supabaseAdmin.from("postComments").select("id").eq("postId", postId);
  if (comments && comments.length > 0) {
    const commentIds = comments.map((c) => c.id);
    await supabaseAdmin.from("commentLikes").delete().in("commentId", commentIds);
    await supabaseAdmin.from("postComments").delete().eq("postId", postId);
  }
  await supabaseAdmin.from("posts").delete().eq("id", postId);
  const { data: profile } = await supabaseAdmin.from("creatorProfiles").select("postsCount").eq("id", creatorId).single();
  if (profile) {
    await supabaseAdmin.from("creatorProfiles").update({
      postsCount: Math.max((profile.postsCount || 0) - 1, 0),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", creatorId);
  }
}
async function updatePost(postId, data) {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("posts").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", postId);
  if (error) {
    console.error("[Database] Error updating post:", error);
  }
}
async function likePost(postId, userId) {
  if (!supabaseAdmin) return;
  const { error: insertError } = await supabaseAdmin.from("postLikes").insert({
    postId,
    userId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (insertError) {
    console.error("[Database] Error liking post:", insertError);
    return;
  }
  const { data: post } = await supabaseAdmin.from("posts").select("likesCount").eq("id", postId).single();
  if (post) {
    await supabaseAdmin.from("posts").update({
      likesCount: (post.likesCount || 0) + 1,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", postId);
  }
}
async function unlikePost(postId, userId) {
  if (!supabaseAdmin) return;
  const { error: deleteError } = await supabaseAdmin.from("postLikes").delete().match({ postId, userId });
  if (deleteError) {
    console.error("[Database] Error unliking post:", deleteError);
    return;
  }
  const { data: post } = await supabaseAdmin.from("posts").select("likesCount").eq("id", postId).single();
  if (post) {
    await supabaseAdmin.from("posts").update({
      likesCount: Math.max((post.likesCount || 0) - 1, 0),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", postId);
  }
}
async function hasLikedPost(postId, userId) {
  if (!supabaseAdmin) return false;
  const { data, error } = await supabaseAdmin.from("postLikes").select("id").match({ postId, userId }).single();
  return !error && !!data;
}
async function createComment(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("postComments").insert({
    ...data,
    likesCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating comment:", error);
    throw error;
  }
  const { data: post } = await supabaseAdmin.from("posts").select("commentsCount").eq("id", data.postId).single();
  if (post) {
    await supabaseAdmin.from("posts").update({
      commentsCount: (post.commentsCount || 0) + 1,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", data.postId);
  }
  return result.id;
}
async function getPostComments(postId, currentUserId, limit = 50, offset = 0) {
  if (!supabaseAdmin) return [];
  const { data: comments, error } = await supabaseAdmin.from("postComments").select("*").eq("postId", postId).order("createdAt", { ascending: false }).range(offset, offset + limit - 1);
  if (error || !comments) return [];
  const userIds = [...new Set(comments.map((c) => c.userId))];
  const { data: users } = await supabaseAdmin.from("users").select("id, name").in("id", userIds);
  const usersMap = new Map((users || []).map((u) => [u.id, u]));
  let likedCommentIds = /* @__PURE__ */ new Set();
  if (currentUserId) {
    const commentIds = comments.map((c) => c.id);
    const { data: likes } = await supabaseAdmin.from("commentLikes").select("commentId").eq("userId", currentUserId).in("commentId", commentIds);
    likedCommentIds = new Set((likes || []).map((l) => l.commentId));
  }
  return comments.map((comment) => ({
    comment,
    user: usersMap.get(comment.userId) || { id: comment.userId, name: null },
    isLiked: likedCommentIds.has(comment.id)
  }));
}
async function deleteComment(commentId, postId) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("commentLikes").delete().eq("commentId", commentId);
  await supabaseAdmin.from("postComments").delete().eq("id", commentId);
  const { data: post } = await supabaseAdmin.from("posts").select("commentsCount").eq("id", postId).single();
  if (post) {
    await supabaseAdmin.from("posts").update({
      commentsCount: Math.max((post.commentsCount || 0) - 1, 0),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", postId);
  }
}
async function likeComment(commentId, userId) {
  if (!supabaseAdmin) return;
  const { error: insertError } = await supabaseAdmin.from("commentLikes").insert({
    commentId,
    userId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (insertError) {
    console.error("[Database] Error liking comment:", insertError);
    return;
  }
  const { data: comment } = await supabaseAdmin.from("postComments").select("likesCount").eq("id", commentId).single();
  if (comment) {
    await supabaseAdmin.from("postComments").update({
      likesCount: (comment.likesCount || 0) + 1,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", commentId);
  }
}
async function unlikeComment(commentId, userId) {
  if (!supabaseAdmin) return;
  const { error: deleteError } = await supabaseAdmin.from("commentLikes").delete().match({ commentId, userId });
  if (deleteError) {
    console.error("[Database] Error unliking comment:", deleteError);
    return;
  }
  const { data: comment } = await supabaseAdmin.from("postComments").select("likesCount").eq("id", commentId).single();
  if (comment) {
    await supabaseAdmin.from("postComments").update({
      likesCount: Math.max((comment.likesCount || 0) - 1, 0),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", commentId);
  }
}
async function createNotification(data) {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("notifications").insert({
    ...data,
    isRead: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (error) {
    console.error("[Database] Error creating notification:", error);
  }
}
async function getUserNotifications(userId, limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("notifications").select("*").eq("userId", userId).order("createdAt", { ascending: false }).range(offset, offset + limit - 1);
  if (error) {
    console.error("[Database] Error fetching notifications:", error);
    return [];
  }
  return data || [];
}
async function markNotificationAsRead(notificationId, userId) {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("notifications").update({ isRead: true }).match({ id: notificationId, userId });
  if (error) {
    console.error("[Database] Error marking notification as read:", error);
  }
}
async function markAllNotificationsAsRead(userId) {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("notifications").update({ isRead: true }).eq("userId", userId);
  if (error) {
    console.error("[Database] Error marking all notifications as read:", error);
  }
}
async function getUnreadNotificationsCount(userId) {
  if (!supabaseAdmin) return 0;
  const { count, error } = await supabaseAdmin.from("notifications").select("*", { count: "exact", head: true }).eq("userId", userId).eq("isRead", false);
  if (error) {
    console.error("[Database] Error counting unread notifications:", error);
    return 0;
  }
  return count || 0;
}

// server/routers-social.ts
var creatorRouter = router({
  // Get current user's creator profile
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    return await getCreatorProfileByUserId(ctx.user.id);
  }),
  // Get creator profile by ID
  getById: publicProcedure.input(z5.object({ id: z5.number() })).query(async ({ input }) => {
    return await getCreatorProfileById(input.id);
  }),
  // Create creator profile
  create: protectedProcedure.input(
    z5.object({
      displayName: z5.string().min(2).max(100),
      bio: z5.string().max(500).optional(),
      instagram: z5.string().max(100).optional(),
      youtube: z5.string().max(100).optional(),
      website: z5.string().max(255).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const existing = await getCreatorProfileByUserId(ctx.user.id);
    if (existing) {
      throw new Error("Voc\xEA j\xE1 possui um perfil de criadora");
    }
    const profileId = await createCreatorProfile({
      userId: ctx.user.id,
      ...input,
      status: "approved"
      // Auto-approve for now
    });
    return { success: true, profileId };
  }),
  // Update creator profile
  update: protectedProcedure.input(
    z5.object({
      displayName: z5.string().min(2).max(100).optional(),
      bio: z5.string().max(500).optional(),
      avatarUrl: z5.string().max(500).optional(),
      coverUrl: z5.string().max(500).optional(),
      instagram: z5.string().max(100).optional(),
      youtube: z5.string().max(100).optional(),
      website: z5.string().max(255).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    await updateCreatorProfile(ctx.user.id, input);
    return { success: true };
  }),
  // List approved creators
  list: publicProcedure.input(
    z5.object({
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getApprovedCreators(input.limit, input.offset);
  })
});
var followersRouter = router({
  // Follow a creator
  follow: protectedProcedure.input(z5.object({ userId: z5.number() })).mutation(async ({ input, ctx }) => {
    if (input.userId === ctx.user.id) {
      throw new Error("Voc\xEA n\xE3o pode seguir a si mesma");
    }
    const alreadyFollowing = await isFollowing(ctx.user.id, input.userId);
    if (alreadyFollowing) {
      throw new Error("Voc\xEA j\xE1 segue esta criadora");
    }
    await followUser(ctx.user.id, input.userId);
    await createNotification({
      userId: input.userId,
      type: "follow",
      title: "Nova seguidora",
      message: `${ctx.user.name || "Algu\xE9m"} come\xE7ou a seguir voc\xEA`,
      linkUrl: `/comunidade/perfil/${ctx.user.id}`
    });
    return { success: true };
  }),
  // Unfollow a creator
  unfollow: protectedProcedure.input(z5.object({ userId: z5.number() })).mutation(async ({ input, ctx }) => {
    await unfollowUser(ctx.user.id, input.userId);
    return { success: true };
  }),
  // Check if following
  isFollowing: protectedProcedure.input(z5.object({ userId: z5.number() })).query(async ({ input, ctx }) => {
    return await isFollowing(ctx.user.id, input.userId);
  }),
  // Get followers list
  followers: publicProcedure.input(
    z5.object({
      userId: z5.number(),
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getFollowers(input.userId, input.limit, input.offset);
  }),
  // Get following list
  following: publicProcedure.input(
    z5.object({
      userId: z5.number(),
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getFollowing(input.userId, input.limit, input.offset);
  })
});
var postsRouter = router({
  // Create a new post
  create: protectedProcedure.input(
    z5.object({
      content: z5.string().max(5e3).optional(),
      visibility: z5.enum(["public", "followers", "private"]).default("public"),
      media: z5.array(
        z5.object({
          mediaUrl: z5.string(),
          mediaType: z5.enum(["image", "video"]),
          thumbnailUrl: z5.string().optional()
        })
      ).max(10).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Voc\xEA precisa criar um perfil de criadora primeiro");
    }
    if (profile.status !== "approved") {
      throw new Error("Seu perfil ainda n\xE3o foi aprovado");
    }
    const postId = await createPost({
      creatorId: profile.id,
      content: input.content,
      visibility: input.visibility
    });
    if (input.media && input.media.length > 0) {
      await addPostMedia(
        input.media.map((m, index) => ({
          postId,
          mediaUrl: m.mediaUrl,
          mediaType: m.mediaType,
          thumbnailUrl: m.thumbnailUrl,
          orderIndex: index
        }))
      );
    }
    return { success: true, postId };
  }),
  // Get post by ID
  getById: publicProcedure.input(z5.object({ id: z5.number() })).query(async ({ input, ctx }) => {
    return await getPostWithDetails(input.id, ctx.user?.id);
  }),
  // Get feed posts
  feed: protectedProcedure.input(
    z5.object({
      type: z5.enum(["all", "following"]).default("all"),
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input, ctx }) => {
    return await getFeedPosts(ctx.user.id, input.limit, input.offset, input.type);
  }),
  // Get creator's posts
  byCreator: publicProcedure.input(
    z5.object({
      creatorId: z5.number(),
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input, ctx }) => {
    return await getCreatorPosts(input.creatorId, ctx.user?.id, input.limit, input.offset);
  }),
  // Update post
  update: protectedProcedure.input(
    z5.object({
      postId: z5.number(),
      content: z5.string().max(5e3).optional(),
      visibility: z5.enum(["public", "followers", "private"]).optional(),
      isPinned: z5.boolean().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const post = await getPostById(input.postId);
    if (!post || post.creatorId !== profile.id) {
      throw new Error("Post n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    const { postId, ...data } = input;
    await updatePost(postId, data);
    return { success: true };
  }),
  // Delete post
  delete: protectedProcedure.input(z5.object({ postId: z5.number() })).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const post = await getPostById(input.postId);
    if (!post || post.creatorId !== profile.id) {
      throw new Error("Post n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    await deletePost(input.postId, profile.id);
    return { success: true };
  })
});
var likesRouter = router({
  // Like a post
  like: protectedProcedure.input(z5.object({ postId: z5.number() })).mutation(async ({ input, ctx }) => {
    const alreadyLiked = await hasLikedPost(input.postId, ctx.user.id);
    if (alreadyLiked) {
      throw new Error("Voc\xEA j\xE1 curtiu este post");
    }
    await likePost(input.postId, ctx.user.id);
    const post = await getPostWithDetails(input.postId);
    if (post && post.creator.userId !== ctx.user.id) {
      await createNotification({
        userId: post.creator.userId,
        type: "like",
        title: "Nova curtida",
        message: `${ctx.user.name || "Algu\xE9m"} curtiu seu post`,
        linkUrl: `/comunidade/post/${input.postId}`
      });
    }
    return { success: true };
  }),
  // Unlike a post
  unlike: protectedProcedure.input(z5.object({ postId: z5.number() })).mutation(async ({ input, ctx }) => {
    await unlikePost(input.postId, ctx.user.id);
    return { success: true };
  }),
  // Like a comment
  likeComment: protectedProcedure.input(z5.object({ commentId: z5.number() })).mutation(async ({ input, ctx }) => {
    await likeComment(input.commentId, ctx.user.id);
    return { success: true };
  }),
  // Unlike a comment
  unlikeComment: protectedProcedure.input(z5.object({ commentId: z5.number() })).mutation(async ({ input, ctx }) => {
    await unlikeComment(input.commentId, ctx.user.id);
    return { success: true };
  })
});
var commentsRouter = router({
  // Create comment
  create: protectedProcedure.input(
    z5.object({
      postId: z5.number(),
      content: z5.string().min(1).max(2e3),
      parentId: z5.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const commentId = await createComment({
      postId: input.postId,
      userId: ctx.user.id,
      content: input.content,
      parentId: input.parentId
    });
    const post = await getPostWithDetails(input.postId);
    if (post && post.creator.userId !== ctx.user.id) {
      await createNotification({
        userId: post.creator.userId,
        type: "comment",
        title: "Novo coment\xE1rio",
        message: `${ctx.user.name || "Algu\xE9m"} comentou no seu post`,
        linkUrl: `/comunidade/post/${input.postId}`
      });
    }
    return { success: true, commentId };
  }),
  // Get comments for a post
  list: publicProcedure.input(
    z5.object({
      postId: z5.number(),
      limit: z5.number().min(1).max(100).default(50),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input, ctx }) => {
    return await getPostComments(input.postId, ctx.user?.id, input.limit, input.offset);
  }),
  // Delete comment
  delete: protectedProcedure.input(z5.object({ commentId: z5.number(), postId: z5.number() })).mutation(async ({ input, ctx }) => {
    await deleteComment(input.commentId, input.postId);
    return { success: true };
  })
});
var notificationsRouter = router({
  // Get user notifications
  list: protectedProcedure.input(
    z5.object({
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input, ctx }) => {
    return await getUserNotifications(ctx.user.id, input.limit, input.offset);
  }),
  // Get unread count
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await getUnreadNotificationsCount(ctx.user.id);
  }),
  // Mark as read
  markAsRead: protectedProcedure.input(z5.object({ notificationId: z5.number() })).mutation(async ({ input, ctx }) => {
    await markNotificationAsRead(input.notificationId, ctx.user.id);
    return { success: true };
  }),
  // Mark all as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
  })
});
var socialRouter = router({
  creator: creatorRouter,
  followers: followersRouter,
  posts: postsRouter,
  likes: likesRouter,
  comments: commentsRouter,
  notifications: notificationsRouter
});

// server/routers-courses.ts
import { z as z6 } from "zod";

// server/db-courses.ts
async function createCourse(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("courses").insert({
    ...data,
    status: data.status || "draft",
    isFeatured: data.isFeatured || false,
    lessonsCount: 0,
    totalDurationMinutes: 0,
    studentsCount: 0,
    reviewsCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating course:", error);
    throw error;
  }
  const { data: profile } = await supabaseAdmin.from("creatorProfiles").select("coursesCount").eq("id", data.creatorId).single();
  if (profile) {
    await supabaseAdmin.from("creatorProfiles").update({
      coursesCount: (profile.coursesCount || 0) + 1,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", data.creatorId);
  }
  return result.id;
}
async function updateCourse(courseId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("courses").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", courseId);
  if (error) {
    console.error("[Database] Error updating course:", error);
    throw error;
  }
}
async function getCourseById(courseId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("courses").select("*").eq("id", courseId).single();
  if (error) return null;
  return data;
}
async function getCourseBySlug(slug) {
  if (!supabaseAdmin) return null;
  const { data: course, error } = await supabaseAdmin.from("courses").select("*").eq("slug", slug).single();
  if (error || !course) return null;
  const { data: creator } = await supabaseAdmin.from("creatorProfiles").select("id, displayName, avatarUrl, userId").eq("id", course.creatorId).single();
  return {
    course,
    creator: creator || { id: course.creatorId, displayName: "Unknown", avatarUrl: null, userId: 0 }
  };
}
async function getCourseWithModules(courseId) {
  if (!supabaseAdmin) return null;
  const course = await getCourseById(courseId);
  if (!course) return null;
  const { data: modules } = await supabaseAdmin.from("courseModules").select("*").eq("courseId", courseId).order("orderIndex", { ascending: true });
  if (!modules) return { ...course, modules: [] };
  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => {
      const { data: lessons } = await supabaseAdmin.from("courseLessons").select("*").eq("moduleId", module.id).order("orderIndex", { ascending: true });
      return { ...module, lessons: lessons || [] };
    })
  );
  return { ...course, modules: modulesWithLessons };
}
async function getPublishedCourses(limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];
  try {
    const { data: courses, error } = await supabaseAdmin.from("courses").select("*").eq("status", "published").order("createdAt", { ascending: false }).range(offset, offset + limit - 1);
    if (error || !courses || courses.length === 0) return [];
    const creatorIds = [...new Set(courses.map((c) => c.creatorId))];
    let creatorsMap = /* @__PURE__ */ new Map();
    if (creatorIds.length > 0) {
      const { data: creators } = await supabaseAdmin.from("creatorProfiles").select("id, displayName, avatarUrl").in("id", creatorIds);
      if (creators) {
        creatorsMap = new Map(creators.map((c) => [c.id, c]));
      }
    }
    return courses.map((course) => ({
      course,
      creator: creatorsMap.get(course.creatorId) || { id: course.creatorId, displayName: "Unknown", avatarUrl: null }
    }));
  } catch (err) {
    console.error("[Database] Error in getPublishedCourses:", err);
    return [];
  }
}
async function getFeaturedCourses(limit = 6) {
  if (!supabaseAdmin) return [];
  try {
    const { data: courses, error } = await supabaseAdmin.from("courses").select("*").eq("status", "published").eq("isFeatured", true).order("studentsCount", { ascending: false }).limit(limit);
    if (error || !courses || courses.length === 0) return [];
    const creatorIds = [...new Set(courses.map((c) => c.creatorId))];
    let creatorsMap = /* @__PURE__ */ new Map();
    if (creatorIds.length > 0) {
      const { data: creators } = await supabaseAdmin.from("creatorProfiles").select("id, displayName, avatarUrl").in("id", creatorIds);
      if (creators) {
        creatorsMap = new Map(creators.map((c) => [c.id, c]));
      }
    }
    return courses.map((course) => ({
      course,
      creator: creatorsMap.get(course.creatorId) || { id: course.creatorId, displayName: "Unknown", avatarUrl: null }
    }));
  } catch (err) {
    console.error("[Database] Error in getFeaturedCourses:", err);
    return [];
  }
}
async function getCreatorCourses(creatorId) {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("courses").select("*").eq("creatorId", creatorId).order("createdAt", { ascending: false });
  if (error) return [];
  return data || [];
}
async function deleteCourse(courseId, creatorId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: modules } = await supabaseAdmin.from("courseModules").select("id").eq("courseId", courseId);
  if (modules && modules.length > 0) {
    const moduleIds = modules.map((m) => m.id);
    const { data: lessons } = await supabaseAdmin.from("courseLessons").select("id").in("moduleId", moduleIds);
    if (lessons && lessons.length > 0) {
      const lessonIds = lessons.map((l) => l.id);
      await supabaseAdmin.from("lessonProgress").delete().in("lessonId", lessonIds);
    }
    await supabaseAdmin.from("courseLessons").delete().in("moduleId", moduleIds);
    await supabaseAdmin.from("courseModules").delete().eq("courseId", courseId);
  }
  await supabaseAdmin.from("courseEnrollments").delete().eq("courseId", courseId);
  await supabaseAdmin.from("courseReviews").delete().eq("courseId", courseId);
  await supabaseAdmin.from("courses").delete().eq("id", courseId);
  const { data: profile } = await supabaseAdmin.from("creatorProfiles").select("coursesCount").eq("id", creatorId).single();
  if (profile) {
    await supabaseAdmin.from("creatorProfiles").update({
      coursesCount: Math.max((profile.coursesCount || 0) - 1, 0),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", creatorId);
  }
}
async function createModule(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("courseModules").insert({
    ...data,
    lessonsCount: 0,
    durationMinutes: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating module:", error);
    throw error;
  }
  return result.id;
}
async function updateModule(moduleId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("courseModules").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", moduleId);
  if (error) {
    console.error("[Database] Error updating module:", error);
    throw error;
  }
}
async function getModuleById(moduleId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("courseModules").select("*").eq("id", moduleId).single();
  if (error) return null;
  return data;
}
async function deleteModule(moduleId, courseId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: lessons } = await supabaseAdmin.from("courseLessons").select("id").eq("moduleId", moduleId);
  if (lessons && lessons.length > 0) {
    const lessonIds = lessons.map((l) => l.id);
    await supabaseAdmin.from("lessonProgress").delete().in("lessonId", lessonIds);
    await supabaseAdmin.from("courseLessons").delete().eq("moduleId", moduleId);
  }
  await supabaseAdmin.from("courseModules").delete().eq("id", moduleId);
  await updateCourseLessonCount(courseId);
}
async function reorderModules(courseId, moduleIds) {
  if (!supabaseAdmin) throw new Error("Database not available");
  for (let i = 0; i < moduleIds.length; i++) {
    await supabaseAdmin.from("courseModules").update({
      orderIndex: i,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).match({ id: moduleIds[i], courseId });
  }
}
async function createLesson(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("courseLessons").insert({
    ...data,
    lessonType: data.lessonType || "video",
    isFree: data.isFree || false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating lesson:", error);
    throw error;
  }
  await updateModuleLessonCount(data.moduleId);
  await updateCourseLessonCount(data.courseId);
  return result.id;
}
async function updateLesson(lessonId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("courseLessons").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", lessonId);
  if (error) {
    console.error("[Database] Error updating lesson:", error);
    throw error;
  }
}
async function getLessonById(lessonId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("courseLessons").select("*").eq("id", lessonId).single();
  if (error) return null;
  return data;
}
async function deleteLesson(lessonId, moduleId, courseId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  await supabaseAdmin.from("lessonProgress").delete().eq("lessonId", lessonId);
  await supabaseAdmin.from("courseLessons").delete().eq("id", lessonId);
  await updateModuleLessonCount(moduleId);
  await updateCourseLessonCount(courseId);
}
async function reorderLessons(moduleId, lessonIds) {
  if (!supabaseAdmin) throw new Error("Database not available");
  for (let i = 0; i < lessonIds.length; i++) {
    await supabaseAdmin.from("courseLessons").update({
      orderIndex: i,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).match({ id: lessonIds[i], moduleId });
  }
}
async function updateModuleLessonCount(moduleId) {
  if (!supabaseAdmin) return;
  const { data: lessons } = await supabaseAdmin.from("courseLessons").select("videoDurationSeconds").eq("moduleId", moduleId);
  const count = lessons?.length || 0;
  const duration = (lessons || []).reduce((sum, l) => sum + (l.videoDurationSeconds || 0), 0);
  await supabaseAdmin.from("courseModules").update({
    lessonsCount: count,
    durationMinutes: Math.ceil(duration / 60),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", moduleId);
}
async function updateCourseLessonCount(courseId) {
  if (!supabaseAdmin) return;
  const { data: lessons } = await supabaseAdmin.from("courseLessons").select("videoDurationSeconds").eq("courseId", courseId);
  const count = lessons?.length || 0;
  const duration = (lessons || []).reduce((sum, l) => sum + (l.videoDurationSeconds || 0), 0);
  await supabaseAdmin.from("courses").update({
    lessonsCount: count,
    totalDurationMinutes: Math.ceil(duration / 60),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", courseId);
}
async function createEnrollment(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("courseEnrollments").insert({
    ...data,
    progressPercent: 0,
    completedLessonsCount: 0,
    lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating enrollment:", error);
    throw error;
  }
  const { data: course } = await supabaseAdmin.from("courses").select("studentsCount").eq("id", data.courseId).single();
  if (course) {
    await supabaseAdmin.from("courses").update({
      studentsCount: (course.studentsCount || 0) + 1,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", data.courseId);
  }
  return result.id;
}
async function getEnrollment(courseId, userId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("courseEnrollments").select("*").match({ courseId, userId }).single();
  if (error) return null;
  return data;
}
async function getUserEnrollments(userId) {
  if (!supabaseAdmin) return [];
  try {
    const { data: enrollments, error } = await supabaseAdmin.from("courseEnrollments").select("*").eq("userId", userId).order("lastAccessedAt", { ascending: false });
    if (error || !enrollments || enrollments.length === 0) return [];
    const courseIds = enrollments.map((e) => e.courseId);
    let coursesMap = /* @__PURE__ */ new Map();
    let creatorsMap = /* @__PURE__ */ new Map();
    if (courseIds.length > 0) {
      const { data: courses } = await supabaseAdmin.from("courses").select("*").in("id", courseIds);
      if (courses && courses.length > 0) {
        coursesMap = new Map(courses.map((c) => [c.id, c]));
        const creatorIds = [...new Set(courses.map((c) => c.creatorId))];
        if (creatorIds.length > 0) {
          const { data: creators } = await supabaseAdmin.from("creatorProfiles").select("id, displayName, avatarUrl").in("id", creatorIds);
          if (creators) {
            creatorsMap = new Map(creators.map((c) => [c.id, c]));
          }
        }
      }
    }
    return enrollments.map((enrollment) => {
      const course = coursesMap.get(enrollment.courseId);
      return {
        enrollment,
        course: course || null,
        creator: course ? creatorsMap.get(course.creatorId) || { id: course.creatorId, displayName: "Unknown", avatarUrl: null } : null
      };
    });
  } catch (err) {
    console.error("[Database] Error in getUserEnrollments:", err);
    return [];
  }
}
async function updateEnrollmentProgress(enrollmentId, courseId) {
  if (!supabaseAdmin) return;
  const { count: totalLessons } = await supabaseAdmin.from("courseLessons").select("*", { count: "exact", head: true }).eq("courseId", courseId);
  const { count: completedLessons } = await supabaseAdmin.from("lessonProgress").select("*", { count: "exact", head: true }).eq("enrollmentId", enrollmentId).eq("isCompleted", true);
  const total = totalLessons || 0;
  const completed = completedLessons || 0;
  const progress = total > 0 ? Math.round(completed / total * 100) : 0;
  await supabaseAdmin.from("courseEnrollments").update({
    progressPercent: progress,
    completedLessonsCount: completed,
    lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
    completedAt: progress === 100 ? (/* @__PURE__ */ new Date()).toISOString() : null,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", enrollmentId);
}
async function updateLessonProgress(lessonId, userId, enrollmentId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: existing } = await supabaseAdmin.from("lessonProgress").select("*").match({ lessonId, userId }).single();
  if (existing) {
    await supabaseAdmin.from("lessonProgress").update({
      ...data,
      completedAt: data.isCompleted ? (/* @__PURE__ */ new Date()).toISOString() : null,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", existing.id);
  } else {
    await supabaseAdmin.from("lessonProgress").insert({
      lessonId,
      userId,
      enrollmentId,
      watchedSeconds: data.watchedSeconds || 0,
      isCompleted: data.isCompleted || false,
      completedAt: data.isCompleted ? (/* @__PURE__ */ new Date()).toISOString() : null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  const lesson = await getLessonById(lessonId);
  if (lesson) {
    await updateEnrollmentProgress(enrollmentId, lesson.courseId);
  }
}
async function getLessonProgress(lessonId, userId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("lessonProgress").select("*").match({ lessonId, userId }).single();
  if (error) return null;
  return data;
}
async function getCourseProgress(enrollmentId) {
  if (!supabaseAdmin) return [];
  const { data: enrollment } = await supabaseAdmin.from("courseEnrollments").select("courseId").eq("id", enrollmentId).single();
  if (!enrollment) return [];
  const { data: lessons } = await supabaseAdmin.from("courseLessons").select("*").eq("courseId", enrollment.courseId).order("orderIndex", { ascending: true });
  if (!lessons) return [];
  const lessonIds = lessons.map((l) => l.id);
  const { data: progressRecords } = await supabaseAdmin.from("lessonProgress").select("*").eq("enrollmentId", enrollmentId).in("lessonId", lessonIds);
  const progressMap = new Map((progressRecords || []).map((p) => [p.lessonId, p]));
  return lessons.map((lesson) => ({
    lesson,
    progress: progressMap.get(lesson.id) || null
  }));
}
async function createReview(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("courseReviews").insert({
    ...data,
    isVerified: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating review:", error);
    throw error;
  }
  await updateCourseRating(data.courseId);
  return result.id;
}
async function updateReview(reviewId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("courseReviews").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", reviewId);
  if (error) {
    console.error("[Database] Error updating review:", error);
    throw error;
  }
  const { data: review } = await supabaseAdmin.from("courseReviews").select("courseId").eq("id", reviewId).single();
  if (review) {
    await updateCourseRating(review.courseId);
  }
}
async function getCourseReviews(courseId, limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];
  try {
    const { data: reviews, error } = await supabaseAdmin.from("courseReviews").select("*").eq("courseId", courseId).order("createdAt", { ascending: false }).range(offset, offset + limit - 1);
    if (error || !reviews || reviews.length === 0) return [];
    const userIds = [...new Set(reviews.map((r) => r.userId))];
    let usersMap = /* @__PURE__ */ new Map();
    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin.from("users").select("id, name").in("id", userIds);
      if (users) {
        usersMap = new Map(users.map((u) => [u.id, u]));
      }
    }
    return reviews.map((review) => ({
      review,
      user: usersMap.get(review.userId) || { id: review.userId, name: null }
    }));
  } catch (err) {
    console.error("[Database] Error in getCourseReviews:", err);
    return [];
  }
}
async function updateCourseRating(courseId) {
  if (!supabaseAdmin) return;
  const { data: reviews } = await supabaseAdmin.from("courseReviews").select("rating").eq("courseId", courseId);
  const count = reviews?.length || 0;
  const avgRating = count > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(2) : "0";
  await supabaseAdmin.from("courses").update({
    averageRating: avgRating,
    reviewsCount: count,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", courseId);
}
async function createDigitalProduct(data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: result, error } = await supabaseAdmin.from("digitalProducts").insert({
    ...data,
    status: data.status || "draft",
    salesCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id").single();
  if (error) {
    console.error("[Database] Error creating digital product:", error);
    throw error;
  }
  return result.id;
}
async function updateDigitalProduct(productId, data) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { error } = await supabaseAdmin.from("digitalProducts").update({
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", productId);
  if (error) {
    console.error("[Database] Error updating digital product:", error);
    throw error;
  }
}
async function deleteDigitalProduct(productId, creatorId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  await supabaseAdmin.from("digitalPurchases").delete().eq("productId", productId);
  await supabaseAdmin.from("digitalProducts").delete().eq("id", productId);
}
async function getDigitalProductById(productId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("digitalProducts").select("*").eq("id", productId).single();
  if (error) return null;
  return data;
}
async function getDigitalProductBySlug(slug) {
  if (!supabaseAdmin) return null;
  const { data: product, error } = await supabaseAdmin.from("digitalProducts").select("*").eq("slug", slug).single();
  if (error || !product) return null;
  const { data: creator } = await supabaseAdmin.from("creatorProfiles").select("id, displayName, avatarUrl").eq("id", product.creatorId).single();
  return {
    product,
    creator: creator || { id: product.creatorId, displayName: "Unknown", avatarUrl: null }
  };
}
async function getPublishedDigitalProducts(limit = 20, offset = 0) {
  if (!supabaseAdmin) {
    console.log("[Database] supabaseAdmin not available");
    return [];
  }
  try {
    const { data: products, error } = await supabaseAdmin.from("digitalProducts").select("*").eq("status", "published").order("createdAt", { ascending: false }).range(offset, offset + limit - 1);
    if (error) {
      console.error("[Database] Error fetching digital products:", error);
      return [];
    }
    if (!products || products.length === 0) {
      return [];
    }
    const creatorIds = [...new Set(products.map((p) => p.creatorId))];
    let creatorsMap = /* @__PURE__ */ new Map();
    if (creatorIds.length > 0) {
      const { data: creators, error: creatorsError } = await supabaseAdmin.from("creatorProfiles").select("id, displayName, avatarUrl").in("id", creatorIds);
      if (creatorsError) {
        console.error("[Database] Error fetching creators:", creatorsError);
      } else if (creators) {
        creatorsMap = new Map(creators.map((c) => [c.id, c]));
      }
    }
    return products.map((product) => ({
      product,
      creator: creatorsMap.get(product.creatorId) || { id: product.creatorId, displayName: "Unknown", avatarUrl: null }
    }));
  } catch (err) {
    console.error("[Database] Unexpected error in getPublishedDigitalProducts:", err);
    return [];
  }
}
async function getCreatorDigitalProducts(creatorId) {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("digitalProducts").select("*").eq("creatorId", creatorId).order("createdAt", { ascending: false });
  if (error) return [];
  return data || [];
}
async function createDigitalPurchase(productId, userId, pricePaidCents, orderId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  await supabaseAdmin.from("digitalPurchases").insert({
    productId,
    userId,
    pricePaidCents,
    orderId: orderId || null,
    downloadCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  const { data: product } = await supabaseAdmin.from("digitalProducts").select("salesCount").eq("id", productId).single();
  if (product) {
    await supabaseAdmin.from("digitalProducts").update({
      salesCount: (product.salesCount || 0) + 1,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", productId);
  }
}
async function getUserDigitalPurchases(userId) {
  if (!supabaseAdmin) return [];
  try {
    const { data: purchases, error } = await supabaseAdmin.from("digitalPurchases").select("*").eq("userId", userId).order("createdAt", { ascending: false });
    if (error || !purchases || purchases.length === 0) return [];
    const productIds = purchases.map((p) => p.productId);
    let productsMap = /* @__PURE__ */ new Map();
    let creatorsMap = /* @__PURE__ */ new Map();
    if (productIds.length > 0) {
      const { data: products } = await supabaseAdmin.from("digitalProducts").select("*").in("id", productIds);
      if (products && products.length > 0) {
        productsMap = new Map(products.map((p) => [p.id, p]));
        const creatorIds = [...new Set(products.map((p) => p.creatorId))];
        if (creatorIds.length > 0) {
          const { data: creators } = await supabaseAdmin.from("creatorProfiles").select("id, displayName").in("id", creatorIds);
          if (creators) {
            creatorsMap = new Map(creators.map((c) => [c.id, c]));
          }
        }
      }
    }
    return purchases.map((purchase) => {
      const product = productsMap.get(purchase.productId);
      return {
        purchase,
        product: product || null,
        creator: product ? creatorsMap.get(product.creatorId) || { id: product.creatorId, displayName: "Unknown" } : null
      };
    });
  } catch (err) {
    console.error("[Database] Error in getUserDigitalPurchases:", err);
    return [];
  }
}
async function hasUserPurchasedProduct(productId, userId) {
  if (!supabaseAdmin) return false;
  const { data, error } = await supabaseAdmin.from("digitalPurchases").select("id").match({ productId, userId }).single();
  return !error && !!data;
}
async function incrementDownloadCount(purchaseId) {
  if (!supabaseAdmin) throw new Error("Database not available");
  const { data: purchase } = await supabaseAdmin.from("digitalPurchases").select("downloadCount").eq("id", purchaseId).single();
  if (purchase) {
    await supabaseAdmin.from("digitalPurchases").update({
      downloadCount: (purchase.downloadCount || 0) + 1,
      lastDownloadedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", purchaseId);
  }
}

// server/routers-courses.ts
function generateSlug(title) {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 200);
}
var coursesRouter = router({
  // Get published courses (public)
  list: publicProcedure.input(
    z6.object({
      limit: z6.number().min(1).max(50).default(20),
      offset: z6.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getPublishedCourses(input.limit, input.offset);
  }),
  // Get featured courses
  featured: publicProcedure.input(z6.object({ limit: z6.number().min(1).max(12).default(6) })).query(async ({ input }) => {
    return await getFeaturedCourses(input.limit);
  }),
  // Get course by slug (public)
  getBySlug: publicProcedure.input(z6.object({ slug: z6.string() })).query(async ({ input, ctx }) => {
    const course = await getCourseBySlug(input.slug);
    if (!course) return null;
    let enrollment = null;
    if (ctx.user) {
      enrollment = await getEnrollment(course.course.id, ctx.user.id);
    }
    return { ...course, enrollment };
  }),
  // Get course with all modules and lessons
  getWithContent: protectedProcedure.input(z6.object({ courseId: z6.number() })).query(async ({ input, ctx }) => {
    const course = await getCourseWithModules(input.courseId);
    if (!course) {
      throw new Error("Curso n\xE3o encontrado");
    }
    const enrollment = await getEnrollment(input.courseId, ctx.user.id);
    if (!enrollment) {
      const modulesWithFreeLessons = course.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          videoUrl: lesson.isFree ? lesson.videoUrl : null,
          content: lesson.isFree ? lesson.content : null,
          downloadUrl: lesson.isFree ? lesson.downloadUrl : null
        }))
      }));
      return { ...course, modules: modulesWithFreeLessons, enrollment: null };
    }
    const progress = await getCourseProgress(enrollment.id);
    return { ...course, enrollment, progress };
  }),
  // Create course (creator only)
  create: protectedProcedure.input(
    z6.object({
      title: z6.string().min(3).max(255),
      description: z6.string().optional(),
      shortDescription: z6.string().max(500).optional(),
      thumbnailUrl: z6.string().max(500).optional(),
      previewVideoUrl: z6.string().max(500).optional(),
      priceCents: z6.number().min(0),
      compareAtPriceCents: z6.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile || profile.status !== "approved") {
      throw new Error("Voc\xEA precisa ser uma criadora aprovada para criar cursos");
    }
    const slug = generateSlug(input.title) + "-" + Date.now().toString(36);
    const courseId = await createCourse({
      creatorId: profile.id,
      ...input,
      slug,
      status: "draft"
    });
    return { success: true, courseId, slug };
  }),
  // Update course
  update: protectedProcedure.input(
    z6.object({
      courseId: z6.number(),
      title: z6.string().min(3).max(255).optional(),
      description: z6.string().optional(),
      shortDescription: z6.string().max(500).optional(),
      thumbnailUrl: z6.string().max(500).optional(),
      previewVideoUrl: z6.string().max(500).optional(),
      priceCents: z6.number().min(0).optional(),
      compareAtPriceCents: z6.number().optional(),
      status: z6.enum(["draft", "published", "archived"]).optional(),
      isFeatured: z6.boolean().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const course = await getCourseById(input.courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course || !isAdmin && course.creatorId !== profile.id) {
      throw new Error("Curso n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    const { courseId, ...data } = input;
    if (data.status === "published" && course.status !== "published") {
      await updateCourse(courseId, { ...data, publishedAt: /* @__PURE__ */ new Date() });
    } else {
      await updateCourse(courseId, data);
    }
    return { success: true };
  }),
  // Delete course
  delete: protectedProcedure.input(z6.object({ courseId: z6.number() })).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const course = await getCourseById(input.courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course || !isAdmin && course.creatorId !== profile.id) {
      throw new Error("Curso n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    await deleteCourse(input.courseId, profile.id);
    return { success: true };
  }),
  // Get creator's courses
  myCourses: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      return [];
    }
    return await getCreatorCourses(profile.id);
  })
});
var modulesRouter = router({
  // Create module
  create: protectedProcedure.input(
    z6.object({
      courseId: z6.number(),
      title: z6.string().min(1).max(255),
      description: z6.string().optional(),
      orderIndex: z6.number().default(0)
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const course = await getCourseById(input.courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course || !isAdmin && course.creatorId !== profile.id) {
      throw new Error("Curso n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    const moduleId = await createModule(input);
    return { success: true, moduleId };
  }),
  // Update module
  update: protectedProcedure.input(z6.object({
    moduleId: z6.number(),
    courseId: z6.number(),
    title: z6.string().optional(),
    description: z6.string().optional(),
    orderIndex: z6.number().optional()
  })).mutation(async ({ input, ctx }) => {
    const { moduleId, courseId, ...data } = input;
    const module = await getModuleById(moduleId);
    if (!module) throw new Error("M\xF3dulo n\xE3o encontrado");
    if (module.courseId !== courseId) throw new Error("M\xF3dulo n\xE3o pertence ao curso");
    const course = await getCourseById(courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course) throw new Error("Curso n\xE3o encontrado");
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || course.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
    }
    await updateModule(moduleId, data);
    return { success: true };
  }),
  // Delete module
  delete: protectedProcedure.input(z6.object({ moduleId: z6.number(), courseId: z6.number() })).mutation(async ({ input, ctx }) => {
    const { moduleId, courseId } = input;
    const module = await getModuleById(moduleId);
    if (!module) throw new Error("M\xF3dulo n\xE3o encontrado");
    if (module.courseId !== courseId) throw new Error("M\xF3dulo n\xE3o pertence ao curso");
    const course = await getCourseById(courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course) throw new Error("Curso n\xE3o encontrado");
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || course.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
    }
    await deleteModule(moduleId, courseId);
    return { success: true };
  }),
  // Reorder modules
  reorder: protectedProcedure.input(
    z6.object({
      courseId: z6.number(),
      moduleIds: z6.array(z6.number())
    })
  ).mutation(async ({ input }) => {
    await reorderModules(input.courseId, input.moduleIds);
    return { success: true };
  })
});
var lessonsRouter = router({
  // Get lesson by ID
  getById: protectedProcedure.input(z6.object({ lessonId: z6.number() })).query(async ({ input, ctx }) => {
    const lesson = await getLessonById(input.lessonId);
    if (!lesson) {
      throw new Error("Aula n\xE3o encontrada");
    }
    const enrollment = await getEnrollment(lesson.courseId, ctx.user.id);
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    const course = await getCourseById(lesson.courseId);
    const isCreator = profile && course && course.creatorId === profile.id;
    if (!enrollment && !isCreator && !lesson.isFree) {
      throw new Error("Voc\xEA precisa estar matriculado para acessar esta aula");
    }
    let progress = null;
    if (enrollment) {
      progress = await getLessonProgress(input.lessonId, ctx.user.id);
    }
    return { lesson, progress, enrollment };
  }),
  // Create lesson
  create: protectedProcedure.input(
    z6.object({
      moduleId: z6.number(),
      courseId: z6.number(),
      title: z6.string().min(1).max(255),
      description: z6.string().optional(),
      lessonType: z6.enum(["video", "text", "quiz", "download"]).default("video"),
      videoUrl: z6.string().max(500).optional(),
      videoDurationSeconds: z6.number().optional(),
      content: z6.string().optional(),
      downloadUrl: z6.string().max(500).optional(),
      orderIndex: z6.number().default(0),
      isFree: z6.boolean().default(false)
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const course = await getCourseById(input.courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course || !isAdmin && course.creatorId !== profile.id) {
      throw new Error("Curso n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    const lessonId = await createLesson(input);
    return { success: true, lessonId };
  }),
  // Update lesson
  update: protectedProcedure.input(z6.object({
    lessonId: z6.number(),
    courseId: z6.number(),
    moduleId: z6.number().optional(),
    title: z6.string().optional(),
    description: z6.string().optional(),
    lessonType: z6.enum(["video", "text", "quiz", "download"]).optional(),
    videoUrl: z6.string().optional(),
    videoDurationSeconds: z6.number().optional(),
    content: z6.string().optional(),
    downloadUrl: z6.string().optional(),
    isFree: z6.boolean().optional()
  })).mutation(async ({ input, ctx }) => {
    const { lessonId, courseId, ...data } = input;
    const lesson = await getLessonById(lessonId);
    if (!lesson) throw new Error("Aula n\xE3o encontrada");
    const module = await getModuleById(lesson.moduleId);
    if (!module || module.courseId !== courseId) throw new Error("Aula n\xE3o pertence ao curso");
    const course = await getCourseById(courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course) throw new Error("Curso n\xE3o encontrado");
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || course.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
    }
    await updateLesson(lessonId, data);
    return { success: true };
  }),
  // Delete lesson
  delete: protectedProcedure.input(z6.object({ lessonId: z6.number(), moduleId: z6.number(), courseId: z6.number() })).mutation(async ({ input, ctx }) => {
    const { lessonId, moduleId, courseId } = input;
    const lesson = await getLessonById(lessonId);
    if (!lesson) throw new Error("Aula n\xE3o encontrada");
    if (lesson.moduleId !== moduleId) throw new Error("Aula n\xE3o pertence ao m\xF3dulo");
    const module = await getModuleById(moduleId);
    if (!module || module.courseId !== courseId) throw new Error("M\xF3dulo n\xE3o pertence ao curso");
    const course = await getCourseById(courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course) throw new Error("Curso n\xE3o encontrado");
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || course.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
    }
    await deleteLesson(lessonId, moduleId, courseId);
    return { success: true };
  }),
  // Reorder lessons
  reorder: protectedProcedure.input(
    z6.object({
      moduleId: z6.number(),
      lessonIds: z6.array(z6.number())
    })
  ).mutation(async ({ input }) => {
    await reorderLessons(input.moduleId, input.lessonIds);
    return { success: true };
  }),
  // Update progress
  updateProgress: protectedProcedure.input(
    z6.object({
      lessonId: z6.number(),
      watchedSeconds: z6.number().optional(),
      isCompleted: z6.boolean().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const lesson = await getLessonById(input.lessonId);
    if (!lesson) {
      throw new Error("Aula n\xE3o encontrada");
    }
    const enrollment = await getEnrollment(lesson.courseId, ctx.user.id);
    if (!enrollment) {
      throw new Error("Voc\xEA n\xE3o est\xE1 matriculado neste curso");
    }
    await updateLessonProgress(
      input.lessonId,
      ctx.user.id,
      enrollment.id,
      {
        watchedSeconds: input.watchedSeconds,
        isCompleted: input.isCompleted
      }
    );
    return { success: true };
  })
});
var enrollmentsRouter = router({
  // Get user's enrollments
  myEnrollments: protectedProcedure.query(async ({ ctx }) => {
    return await getUserEnrollments(ctx.user.id);
  }),
  // Check enrollment status
  check: protectedProcedure.input(z6.object({ courseId: z6.number() })).query(async ({ input, ctx }) => {
    return await getEnrollment(input.courseId, ctx.user.id);
  }),
  // Enroll in a course (for now, direct enrollment - can add payment later)
  enroll: protectedProcedure.input(
    z6.object({
      courseId: z6.number(),
      orderId: z6.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const course = await getCourseById(input.courseId);
    if (!course) {
      throw new Error("Curso n\xE3o encontrado");
    }
    if (course.status !== "published") {
      throw new Error("Este curso n\xE3o est\xE1 dispon\xEDvel para matr\xEDcula");
    }
    const existing = await getEnrollment(input.courseId, ctx.user.id);
    if (existing) {
      throw new Error("Voc\xEA j\xE1 est\xE1 matriculado neste curso");
    }
    const enrollmentId = await createEnrollment({
      courseId: input.courseId,
      userId: ctx.user.id,
      orderId: input.orderId,
      pricePaidCents: course.priceCents
    });
    return { success: true, enrollmentId };
  })
});
var reviewsRouter = router({
  // Get course reviews
  list: publicProcedure.input(
    z6.object({
      courseId: z6.number(),
      limit: z6.number().min(1).max(50).default(20),
      offset: z6.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getCourseReviews(input.courseId, input.limit, input.offset);
  }),
  // Create review
  create: protectedProcedure.input(
    z6.object({
      courseId: z6.number(),
      rating: z6.number().min(1).max(5),
      title: z6.string().max(255).optional(),
      content: z6.string().max(2e3).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const enrollment = await getEnrollment(input.courseId, ctx.user.id);
    if (!enrollment) {
      throw new Error("Voc\xEA precisa estar matriculado para avaliar");
    }
    const reviewId = await createReview({
      courseId: input.courseId,
      userId: ctx.user.id,
      enrollmentId: enrollment.id,
      rating: input.rating,
      title: input.title,
      content: input.content
    });
    return { success: true, reviewId };
  }),
  // Update review
  update: protectedProcedure.input(
    z6.object({
      reviewId: z6.number(),
      rating: z6.number().min(1).max(5).optional(),
      title: z6.string().max(255).optional(),
      content: z6.string().max(2e3).optional()
    })
  ).mutation(async ({ input }) => {
    const { reviewId, ...data } = input;
    await updateReview(reviewId, data);
    return { success: true };
  })
});
var digitalProductsRouter = router({
  // List published digital products
  list: publicProcedure.input(
    z6.object({
      limit: z6.number().min(1).max(50).default(20),
      offset: z6.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    try {
      console.log("[API] Fetching published digital products...");
      const result = await getPublishedDigitalProducts(input.limit, input.offset);
      console.log(`[API] Found ${result.length} products.`);
      return result;
    } catch (err) {
      console.error("[API] Error fetching digital products:", err);
      throw err;
    }
  }),
  // Get by slug
  getBySlug: publicProcedure.input(z6.object({ slug: z6.string() })).query(async ({ input, ctx }) => {
    const product = await getDigitalProductBySlug(input.slug);
    if (!product) return null;
    let hasPurchased = false;
    if (ctx.user) {
      hasPurchased = await hasUserPurchasedProduct(product.product.id, ctx.user.id);
    }
    return { ...product, hasPurchased };
  }),
  // Create digital product
  create: protectedProcedure.input(
    z6.object({
      title: z6.string().min(3).max(255),
      description: z6.string().optional(),
      shortDescription: z6.string().max(500).optional(),
      thumbnailUrl: z6.string().max(500).optional(),
      previewUrl: z6.string().max(500).optional(),
      fileUrl: z6.string().max(500),
      fileType: z6.string().max(50),
      fileSizeBytes: z6.number().optional(),
      priceCents: z6.number().min(0),
      compareAtPriceCents: z6.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile || profile.status !== "approved") {
      throw new Error("Voc\xEA precisa ser uma criadora aprovada");
    }
    const slug = generateSlug(input.title) + "-" + Date.now().toString(36);
    const productId = await createDigitalProduct({
      creatorId: profile.id,
      ...input,
      slug,
      status: "draft"
    });
    return { success: true, productId, slug };
  }),
  // Update digital product
  update: protectedProcedure.input(
    z6.object({
      productId: z6.number(),
      title: z6.string().min(3).max(255).optional(),
      description: z6.string().optional(),
      shortDescription: z6.string().max(500).optional(),
      thumbnailUrl: z6.string().max(500).optional(),
      previewUrl: z6.string().max(500).optional(),
      fileUrl: z6.string().max(500).optional(),
      fileType: z6.string().max(50).optional(),
      fileSizeBytes: z6.number().optional(),
      priceCents: z6.number().min(0).optional(),
      compareAtPriceCents: z6.number().optional(),
      status: z6.enum(["draft", "published", "archived"]).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const { productId, ...data } = input;
    const product = await getDigitalProductById(productId);
    if (!product) throw new Error("Produto n\xE3o encontrado");
    const isAdmin = ctx.user.role === "admin";
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || product.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
    }
    await updateDigitalProduct(productId, data);
    return { success: true };
  }),
  // Delete digital product
  delete: protectedProcedure.input(z6.object({ productId: z6.number() })).mutation(async ({ input, ctx }) => {
    const product = await getDigitalProductById(input.productId);
    if (!product) throw new Error("Produto n\xE3o encontrado");
    const isAdmin = ctx.user.role === "admin";
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || product.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
      await deleteDigitalProduct(input.productId, profile.id);
    } else {
      await deleteDigitalProduct(input.productId, product.creatorId);
    }
    return { success: true };
  }),
  // Get creator's digital products
  myProducts: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      return [];
    }
    return await getCreatorDigitalProducts(profile.id);
  }),
  // Get user's purchases
  myPurchases: protectedProcedure.query(async ({ ctx }) => {
    const purchases = await getUserDigitalPurchases(ctx.user.id);
    return purchases.map((p) => ({
      purchase: {
        id: p.purchase.id,
        productId: p.purchase.productId,
        pricePaidCents: p.purchase.pricePaidCents,
        downloadCount: p.purchase.downloadCount,
        lastDownloadedAt: p.purchase.lastDownloadedAt,
        createdAt: p.purchase.createdAt
      },
      product: {
        id: p.product.id,
        title: p.product.title,
        slug: p.product.slug,
        fileType: p.product.fileType,
        fileUrl: p.product.fileUrl,
        thumbnailUrl: p.product.thumbnailUrl
      },
      creator: p.creator
    }));
  }),
  // Purchase digital product
  purchase: protectedProcedure.input(z6.object({ productId: z6.number(), orderId: z6.number().optional() })).mutation(async ({ input, ctx }) => {
    const product = await getDigitalProductBySlug("");
    await createDigitalPurchase(
      input.productId,
      ctx.user.id,
      0,
      // Price should come from actual product
      input.orderId
    );
    return { success: true };
  }),
  // Download purchased product
  download: protectedProcedure.input(z6.object({ purchaseId: z6.number() })).mutation(async ({ input, ctx }) => {
    const purchases = await getUserDigitalPurchases(ctx.user.id);
    const purchaseData = purchases.find((p) => p.purchase.id === input.purchaseId);
    if (!purchaseData) {
      throw new Error("Compra n\xE3o encontrada");
    }
    if (!purchaseData.product.fileUrl) {
      throw new Error("Arquivo n\xE3o dispon\xEDvel");
    }
    await incrementDownloadCount(input.purchaseId);
    return {
      success: true,
      downloadUrl: purchaseData.product.fileUrl
    };
  })
});
var marketplaceRouter = router({
  courses: coursesRouter,
  modules: modulesRouter,
  lessons: lessonsRouter,
  enrollments: enrollmentsRouter,
  reviews: reviewsRouter,
  digitalProducts: digitalProductsRouter
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
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
  marketplace: marketplaceRouter
});

// server/db.ts
async function checkConnection() {
  if (!supabaseAdmin) {
    return false;
  }
  try {
    const { error } = await supabaseAdmin.from("users").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  if (!supabaseAdmin) {
    console.warn("[Database] Cannot upsert user: supabaseAdmin not available");
    return;
  }
  try {
    const { error } = await supabaseAdmin.from("users").upsert({
      openId: user.openId,
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastSignedIn: user.lastSignedIn ? new Date(user.lastSignedIn).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      role: user.role || "user",
      active: true
    }, {
      onConflict: "openId"
    });
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  if (!supabaseAdmin) {
    console.warn("[Database] Cannot get user: supabaseAdmin not available");
    return void 0;
  }
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("openId", openId).single();
  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[Database] Error fetching user:", error);
    }
    return void 0;
  }
  return data;
}

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  const req = opts.req;
  const res = opts.res;
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const accessToken = authHeader.substring(7);
      console.log(`[Auth] Verifying token: ${accessToken.substring(0, 10)}...`);
      const supabaseUser = await getSupabaseUser(accessToken);
      if (!supabaseUser) {
        console.error("[Auth] Token validation failed. supabaseUser is null.");
        throw new Error("UNAUTHORIZED_INVALID_TOKEN");
      }
      console.log(`[Auth] User verified: ${supabaseUser.id}`);
      if (supabaseUser) {
        const dbUser = await getUserByOpenId(supabaseUser.id);
        if (dbUser) {
          user = dbUser;
        } else {
          await upsertUser({
            openId: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || null,
            email: supabaseUser.email ?? null,
            loginMethod: supabaseUser.app_metadata?.provider ?? "email",
            lastSignedIn: /* @__PURE__ */ new Date()
          });
          user = await getUserByOpenId(supabaseUser.id) ?? null;
        }
      }
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg === "UNAUTHORIZED_INVALID_TOKEN") {
      console.error("[Auth] Request rejected: Invalid Token");
      throw new Error("Unauthorized: Invalid Token");
    }
    console.error("[Auth] Error authenticating request:", error);
    user = null;
  }
  return {
    req,
    res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
async function setupVite(app, server) {
  const { createServer: createViteServer } = await import("vite");
  const viteConfig = (await Promise.resolve().then(() => (init_vite_config(), vite_config_exports))).default;
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
var allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173"
].filter(Boolean);
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin && process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 100,
    // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas requisi\xE7\xF5es. Tente novamente em alguns minutos." }
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 10,
    // Limit each IP to 10 auth attempts per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." }
  });
  app.use("/api", generalLimiter);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", async (req, res) => {
    try {
      const dbConnected = await checkConnection();
      res.json({
        status: dbConnected ? "healthy" : "degraded",
        database: dbConnected ? "connected" : "disconnected",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        database: "error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
