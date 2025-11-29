import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, boolean, json, index, serial, unique } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const orderStatusEnum = pgEnum("order_status", [
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "EM_SEPARACAO",
  "POSTADO",
  "EM_TRANSITO",
  "ENTREGUE",
  "CANCELADO",
  "REEMBOLSADO",
]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "PENDENTE",
  "ETIQUETA_GERADA",
  "POSTADO",
  "EM_TRANSITO",
  "SAIU_PARA_ENTREGA",
  "ENTREGUE",
  "DEVOLVIDO",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "authorized",
  "paid",
  "refunded",
  "failed",
  "canceled",
]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Supabase Auth user ID. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  cpf: varchar("cpf", { length: 14 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table - Books for sale
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  priceCents: integer("priceCents").notNull(),
  compareAtPriceCents: integer("compareAtPriceCents"),
  stockQuantity: integer("stockQuantity").default(0).notNull(),
  weightGrams: integer("weightGrams").default(300).notNull(),
  widthCm: decimal("widthCm", { precision: 5, scale: 2 }).default("14").notNull(),
  heightCm: decimal("heightCm", { precision: 5, scale: 2 }).default("21").notNull(),
  depthCm: decimal("depthCm", { precision: 5, scale: 2 }).default("2").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  activeIdx: index("active_idx").on(table.active),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Addresses table
 */
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  cep: varchar("cep", { length: 10 }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  number: varchar("number", { length: 20 }).notNull(),
  complement: varchar("complement", { length: 100 }),
  district: varchar("district", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

/**
 * Orders table
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  addressId: integer("addressId"),
  subtotalCents: integer("subtotalCents").notNull(),
  shippingPriceCents: integer("shippingPriceCents").notNull(),
  discountCents: integer("discountCents").default(0).notNull(),
  totalCents: integer("totalCents").notNull(),
  status: orderStatusEnum("status").default("AGUARDANDO_PAGAMENTO").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  shippingAddress: json("shippingAddress"),
  customerNotes: text("customerNotes"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  cancelledAt: timestamp("cancelledAt"),
}, (table) => ({
  userIdIdx: index("orders_user_id_idx").on(table.userId),
  statusIdx: index("orders_status_idx").on(table.status),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table
 */
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPriceCents: integer("unitPriceCents").notNull(),
  totalPriceCents: integer("totalPriceCents").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Shipments table
 */
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull().unique(),
  shippingMethod: varchar("shippingMethod", { length: 50 }).notNull(),
  shippingPriceCents: integer("shippingPriceCents").notNull(),
  trackingCode: varchar("trackingCode", { length: 50 }),
  trackingUrl: varchar("trackingUrl", { length: 500 }),
  status: shipmentStatusEnum("status").default("PENDENTE").notNull(),
  labelUrl: varchar("labelUrl", { length: 500 }),
  estimatedDeliveryDays: integer("estimatedDeliveryDays"),
  postedAt: timestamp("postedAt"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;

/**
 * Payment transactions table
 */
export const paymentTransactions = pgTable("paymentTransactions", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  externalId: varchar("externalId", { length: 100 }),
  gateway: varchar("gateway", { length: 50 }).default("pagarme").notNull(),
  method: varchar("method", { length: 50 }).notNull(),
  amountCents: integer("amountCents").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  gatewayResponse: json("gatewayResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;
