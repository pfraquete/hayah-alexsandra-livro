import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { products, orders, orderItems, addresses, type InsertOrder, type InsertOrderItem, type InsertAddress } from "../drizzle/schema";

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
