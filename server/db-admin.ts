import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { orders, orderItems, users, shipments, products, type InsertShipment } from "../drizzle/schema";

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

// ============================================================
// Shipment Management
// ============================================================

export async function createShipment(data: InsertShipment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(shipments).values(data);
  return Number(result[0].insertId);
}

export async function getShipmentByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(shipments).where(eq(shipments.orderId, orderId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateShipmentTracking(
  orderId: number,
  trackingCode: string,
  trackingUrl: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if shipment exists
  const existing = await getShipmentByOrderId(orderId);

  if (existing) {
    await db
      .update(shipments)
      .set({
        trackingCode,
        trackingUrl,
        status: "ETIQUETA_GERADA",
      })
      .where(eq(shipments.orderId, orderId));
  } else {
    // Get order to retrieve shipping info
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (order.length === 0) throw new Error("Order not found");

    await db.insert(shipments).values({
      orderId,
      shippingMethod: "PAC",
      shippingPriceCents: order[0].shippingPriceCents,
      trackingCode,
      trackingUrl,
      status: "ETIQUETA_GERADA",
    });
  }
}

export async function updateShipmentStatus(
  orderId: number,
  status: "PENDENTE" | "ETIQUETA_GERADA" | "POSTADO" | "EM_TRANSITO" | "SAIU_PARA_ENTREGA" | "ENTREGUE" | "DEVOLVIDO"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = { status };

  if (status === "POSTADO") {
    updateData.postedAt = new Date();
  } else if (status === "ENTREGUE") {
    updateData.deliveredAt = new Date();
  }

  await db.update(shipments).set(updateData).where(eq(shipments.orderId, orderId));
}

// ============================================================
// Product/Stock Management
// ============================================================

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(products);
}

export async function updateProductStock(productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(products).set({ stockQuantity: quantity }).where(eq(products.id, productId));
}

export async function updateProduct(
  productId: number,
  data: {
    name?: string;
    description?: string;
    priceCents?: number;
    compareAtPriceCents?: number | null;
    stockQuantity?: number;
    active?: boolean;
    imageUrl?: string | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(products).set(data).where(eq(products.id, productId));
}

export async function createProduct(data: {
  name: string;
  slug: string;
  description?: string;
  priceCents: number;
  compareAtPriceCents?: number;
  stockQuantity?: number;
  imageUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values({
    ...data,
    active: true,
  });
  return Number(result[0].insertId);
}
