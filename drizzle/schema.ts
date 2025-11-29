import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  cpf: varchar("cpf", { length: 14 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table - Books for sale
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  priceCents: int("priceCents").notNull(),
  compareAtPriceCents: int("compareAtPriceCents"),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  weightGrams: int("weightGrams").default(300).notNull(),
  widthCm: decimal("widthCm", { precision: 5, scale: 2 }).default("14").notNull(),
  heightCm: decimal("heightCm", { precision: 5, scale: 2 }).default("21").notNull(),
  depthCm: decimal("depthCm", { precision: 5, scale: 2 }).default("2").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Addresses table
 */
export const addresses = mysqlTable("addresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

/**
 * Orders table
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  addressId: int("addressId"),
  subtotalCents: int("subtotalCents").notNull(),
  shippingPriceCents: int("shippingPriceCents").notNull(),
  discountCents: int("discountCents").default(0).notNull(),
  totalCents: int("totalCents").notNull(),
  status: mysqlEnum("status", [
    "AGUARDANDO_PAGAMENTO",
    "PAGO",
    "EM_SEPARACAO",
    "POSTADO",
    "EM_TRANSITO",
    "ENTREGUE",
    "CANCELADO",
    "REEMBOLSADO",
  ]).default("AGUARDANDO_PAGAMENTO").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  shippingAddress: json("shippingAddress"),
  customerNotes: text("customerNotes"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  paidAt: timestamp("paidAt"),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  cancelledAt: timestamp("cancelledAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPriceCents: int("unitPriceCents").notNull(),
  totalPriceCents: int("totalPriceCents").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Shipments table
 */
export const shipments = mysqlTable("shipments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().unique(),
  shippingMethod: varchar("shippingMethod", { length: 50 }).notNull(),
  shippingPriceCents: int("shippingPriceCents").notNull(),
  trackingCode: varchar("trackingCode", { length: 50 }),
  trackingUrl: varchar("trackingUrl", { length: 500 }),
  status: mysqlEnum("status", [
    "PENDENTE",
    "ETIQUETA_GERADA",
    "POSTADO",
    "EM_TRANSITO",
    "SAIU_PARA_ENTREGA",
    "ENTREGUE",
    "DEVOLVIDO",
  ]).default("PENDENTE").notNull(),
  labelUrl: varchar("labelUrl", { length: 500 }),
  estimatedDeliveryDays: int("estimatedDeliveryDays"),
  postedAt: timestamp("postedAt"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;

/**
 * Payment transactions table
 */
export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  externalId: varchar("externalId", { length: 100 }),
  gateway: varchar("gateway", { length: 50 }).default("pagarme").notNull(),
  method: varchar("method", { length: 50 }).notNull(),
  amountCents: int("amountCents").notNull(),
  status: mysqlEnum("status", [
    "pending",
    "processing",
    "authorized",
    "paid",
    "refunded",
    "failed",
    "canceled",
  ]).default("pending").notNull(),
  gatewayResponse: json("gatewayResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;