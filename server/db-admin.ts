import { supabaseAdmin } from "./supabase";

// Types for admin module
export interface InsertShipment {
  orderId: number;
  shippingMethod: string;
  shippingPriceCents: number;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  status?: string;
  estimatedDelivery?: Date | null;
}

export async function getAllOrders() {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("[Database] Error fetching all orders:", error);
    return [];
  }

  return data || [];
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (status === 'PAGO') {
    updateData.paidAt = new Date().toISOString();
  } else if (status === 'POSTADO') {
    updateData.shippedAt = new Date().toISOString();
  } else if (status === 'ENTREGUE') {
    updateData.deliveredAt = new Date().toISOString();
  } else if (status === 'CANCELADO') {
    updateData.cancelledAt = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) {
    console.error("[Database] Error updating order status:", error);
    throw error;
  }
}

export async function updateOrderAdminNotes(orderId: number, adminNotes: string): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      adminNotes,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    console.error("[Database] Error updating order admin notes:", error);
    throw error;
  }
}

export async function getAllUsers() {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("[Database] Error fetching all users:", error);
    return [];
  }

  return data || [];
}

export async function updateUser(userId: number, data: { role?: "user" | "admin"; active?: boolean }): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error("[Database] Error updating user:", error);
    throw error;
  }
}

export async function getOrderWithUser(orderId: number) {
  if (!supabaseAdmin) return null;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) return null;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', order.userId)
    .single();

  const { data: items } = await supabaseAdmin
    .from('orderItems')
    .select('*')
    .eq('orderId', orderId);

  return {
    ...order,
    user: user || null,
    items: items || [],
  };
}

// ============================================================
// Shipment Management
// ============================================================

export async function createShipment(data: InsertShipment): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('shipments')
    .insert({
      ...data,
      status: data.status || 'PENDENTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating shipment:", error);
    throw error;
  }

  return result.id;
}

export async function getShipmentByOrderId(orderId: number) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('orderId', orderId)
    .single();

  if (error) return null;
  return data;
}

export async function updateShipmentTracking(
  orderId: number,
  trackingCode: string,
  trackingUrl: string
): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const existing = await getShipmentByOrderId(orderId);

  if (existing) {
    const { error } = await supabaseAdmin
      .from('shipments')
      .update({
        trackingCode,
        trackingUrl,
        status: 'ETIQUETA_GERADA',
        updatedAt: new Date().toISOString(),
      })
      .eq('orderId', orderId);

    if (error) {
      console.error("[Database] Error updating shipment tracking:", error);
      throw error;
    }
  } else {
    // Get order to retrieve shipping info
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('shippingPriceCents')
      .eq('id', orderId)
      .single();

    if (orderError || !order) throw new Error("Order not found");

    const { error } = await supabaseAdmin
      .from('shipments')
      .insert({
        orderId,
        shippingMethod: 'PAC',
        shippingPriceCents: order.shippingPriceCents,
        trackingCode,
        trackingUrl,
        status: 'ETIQUETA_GERADA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    if (error) {
      console.error("[Database] Error creating shipment with tracking:", error);
      throw error;
    }
  }
}

export async function updateShipmentStatus(
  orderId: number,
  status: "PENDENTE" | "ETIQUETA_GERADA" | "POSTADO" | "EM_TRANSITO" | "SAIU_PARA_ENTREGA" | "ENTREGUE" | "DEVOLVIDO"
): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (status === 'POSTADO') {
    updateData.postedAt = new Date().toISOString();
  } else if (status === 'ENTREGUE') {
    updateData.deliveredAt = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from('shipments')
    .update(updateData)
    .eq('orderId', orderId);

  if (error) {
    console.error("[Database] Error updating shipment status:", error);
    throw error;
  }
}

// ============================================================
// Product/Stock Management
// ============================================================

export async function getAllProducts() {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("[Database] Error fetching all products:", error);
    return [];
  }

  return data || [];
}

export async function updateProductStock(productId: number, quantity: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      stockQuantity: quantity,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) {
    console.error("[Database] Error updating product stock:", error);
    throw error;
  }
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
): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) {
    console.error("[Database] Error updating product:", error);
    throw error;
  }
}

export async function createProduct(data: {
  name: string;
  slug: string;
  description?: string;
  priceCents: number;
  compareAtPriceCents?: number;
  stockQuantity?: number;
  imageUrl?: string;
}): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('products')
    .insert({
      ...data,
      active: true,
      productType: 'physical',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating product:", error);
    throw error;
  }

  return result.id;
}

export async function deleteProduct(productId: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error("[Database] Error deleting product:", error);
    throw error;
  }
}

// ============================================================
// Social Moderation
// ============================================================

export async function getAllPosts() {
  if (!supabaseAdmin) return [];

  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('id, content, createdAt, creatorId')
    .order('createdAt', { ascending: false });

  if (error || !posts) return [];

  const creatorIds = [...new Set(posts.map(p => p.creatorId))];
  const { data: creators } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName')
    .in('id', creatorIds);

  const creatorsMap = new Map((creators || []).map(c => [c.id, c]));

  return posts.map(post => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    creatorName: creatorsMap.get(post.creatorId)?.displayName || null,
    creatorId: post.creatorId,
  }));
}

export async function adminDeletePost(postId: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Delete media
  await supabaseAdmin.from('postMedia').delete().eq('postId', postId);

  // Delete likes
  await supabaseAdmin.from('postLikes').delete().eq('postId', postId);

  // Get comments and delete comment likes
  const { data: comments } = await supabaseAdmin
    .from('postComments')
    .select('id')
    .eq('postId', postId);

  if (comments && comments.length > 0) {
    const commentIds = comments.map(c => c.id);
    await supabaseAdmin.from('commentLikes').delete().in('commentId', commentIds);
  }

  // Delete comments
  await supabaseAdmin.from('postComments').delete().eq('postId', postId);

  // Delete post
  const { error } = await supabaseAdmin
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error("[Database] Error deleting post:", error);
    throw error;
  }
}

export async function getAllComments() {
  if (!supabaseAdmin) return [];

  const { data: comments, error } = await supabaseAdmin
    .from('postComments')
    .select('id, content, createdAt, postId, userId')
    .order('createdAt', { ascending: false });

  if (error || !comments) return [];

  const userIds = [...new Set(comments.map(c => c.userId))];
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .in('id', userIds);

  const usersMap = new Map((users || []).map(u => [u.id, u]));

  return comments.map(comment => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    postId: comment.postId,
    userName: usersMap.get(comment.userId)?.name || null,
    userId: comment.userId,
  }));
}

export async function adminDeleteComment(commentId: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Delete comment likes
  await supabaseAdmin.from('commentLikes').delete().eq('commentId', commentId);

  // Delete comment
  const { error } = await supabaseAdmin
    .from('postComments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error("[Database] Error deleting comment:", error);
    throw error;
  }
}

// ============================================================
// Marketplace Management (Admin View)
// ============================================================

export async function getAllCourses() {
  if (!supabaseAdmin) return [];

  const { data: courses, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error || !courses) return [];

  const creatorIds = [...new Set(courses.map(c => c.creatorId))];
  const { data: creators } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName')
    .in('id', creatorIds);

  const creatorsMap = new Map((creators || []).map(c => [c.id, c]));

  return courses.map(course => ({
    course,
    creator: creatorsMap.get(course.creatorId) || { id: course.creatorId, displayName: null },
  }));
}

export async function getAllDigitalProducts() {
  if (!supabaseAdmin) return [];

  const { data: products, error } = await supabaseAdmin
    .from('digitalProducts')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error || !products) return [];

  const creatorIds = [...new Set(products.map(p => p.creatorId))];
  const { data: creators } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName')
    .in('id', creatorIds);

  const creatorsMap = new Map((creators || []).map(c => [c.id, c]));

  return products.map(product => ({
    product,
    creator: creatorsMap.get(product.creatorId) || { id: product.creatorId, displayName: null },
  }));
}
