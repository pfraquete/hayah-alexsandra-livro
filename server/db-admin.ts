import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { orders, orderItems, users } from "../drizzle/schema";

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orders);
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  
  if (status === 'PAGO' && !updateData.paidAt) {
    updateData.paidAt = new Date();
  } else if (status === 'POSTADO' && !updateData.shippedAt) {
    updateData.shippedAt = new Date();
  } else if (status === 'ENTREGUE' && !updateData.deliveredAt) {
    updateData.deliveredAt = new Date();
  } else if (status === 'CANCELADO' && !updateData.cancelledAt) {
    updateData.cancelledAt = new Date();
  }
  
  await db.update(orders).set(updateData).where(eq(orders.id, orderId));
}

export async function updateOrderAdminNotes(orderId: number, adminNotes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders).set({ adminNotes }).where(eq(orders.id, orderId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users);
}

export async function getOrderWithUser(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (orderResult.length === 0) return null;
  
  const order = orderResult[0];
  const userResult = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  
  return {
    ...order,
    user: userResult.length > 0 ? userResult[0] : null,
    items,
  };
}
