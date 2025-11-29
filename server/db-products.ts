import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { products, orders, orderItems, addresses, users, shipments, type InsertOrder, type InsertOrderItem, type InsertAddress } from "../drizzle/schema";

export async function getActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(products).where(eq(products.active, true));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createOrder(orderData: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orders).values(orderData);
  return Number(result[0].insertId);
}

export async function createOrderItems(items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(orderItems).values(items);
}

export async function createAddress(addressData: InsertAddress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(addresses).values(addressData);
  return Number(result[0].insertId);
}

export async function getUserAddresses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(addresses).where(eq(addresses.userId, userId));
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ============================================================
// User Profile Management
// ============================================================

export async function updateUserProfile(
  userId: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============================================================
// Address Management
// ============================================================

export async function updateAddress(
  addressId: number,
  userId: number,
  data: {
    recipientName?: string;
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
    isDefault?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify address belongs to user
  const existing = await db
    .select()
    .from(addresses)
    .where(eq(addresses.id, addressId))
    .limit(1);

  if (existing.length === 0 || existing[0].userId !== userId) {
    throw new Error("Address not found");
  }

  // If setting as default, unset other defaults
  if (data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId));
  }

  await db.update(addresses).set(data).where(eq(addresses.id, addressId));
}

export async function deleteAddress(addressId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify address belongs to user
  const existing = await db
    .select()
    .from(addresses)
    .where(eq(addresses.id, addressId))
    .limit(1);

  if (existing.length === 0 || existing[0].userId !== userId) {
    throw new Error("Address not found");
  }

  await db.delete(addresses).where(eq(addresses.id, addressId));
}

// ============================================================
// Order Tracking (Customer Side)
// ============================================================

export async function getOrderWithTracking(orderId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const orderResult = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (orderResult.length === 0 || orderResult[0].userId !== userId) {
    return null;
  }

  const order = orderResult[0];
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const shipmentResult = await db
    .select()
    .from(shipments)
    .where(eq(shipments.orderId, orderId))
    .limit(1);

  return {
    ...order,
    items,
    shipment: shipmentResult.length > 0 ? shipmentResult[0] : null,
  };
}
