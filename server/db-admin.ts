import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { orders, orderItems, users, shipments, products, posts, postComments, creatorProfiles, courses, digitalProducts, type InsertShipment } from "../drizzle/schema";

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

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUser(userId: number, data: { role?: "user" | "admin"; active?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
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

  const result = await db.insert(shipments).values(data).returning({ id: shipments.id });
  return result[0].id;
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
  }).returning({ id: products.id });
  return result[0].id;
}

export async function deleteProduct(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(products).where(eq(products.id, productId));
}

// ============================================================
// Social Moderation
// ============================================================

export async function getAllPosts() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      creatorName: creatorProfiles.displayName,
      creatorId: creatorProfiles.id,
    })
    .from(posts)
    .leftJoin(creatorProfiles, eq(posts.creatorId, creatorProfiles.id))
    .orderBy(desc(posts.createdAt));
}

export async function adminDeletePost(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(posts).where(eq(posts.id, postId));
}

export async function getAllComments() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: postComments.id,
      content: postComments.content,
      createdAt: postComments.createdAt,
      postId: postComments.postId,
      userName: users.name,
      userId: users.id,
    })
    .from(postComments)
    .leftJoin(users, eq(postComments.userId, users.id))
    .orderBy(desc(postComments.createdAt));
}

export async function adminDeleteComment(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(postComments).where(eq(postComments.id, commentId));
}

// ============================================================
// Marketplace Management (Admin View)
// ============================================================

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      course: courses,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
      },
    })
    .from(courses)
    .leftJoin(creatorProfiles, eq(courses.creatorId, creatorProfiles.id))
    .orderBy(desc(courses.createdAt));
}

export async function getAllDigitalProducts() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      product: digitalProducts,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
      },
    })
    .from(digitalProducts)
    .leftJoin(creatorProfiles, eq(digitalProducts.creatorId, creatorProfiles.id))
    .orderBy(desc(digitalProducts.createdAt));
}
