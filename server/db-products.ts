import { supabaseAdmin } from "./supabase";

// Types for products module
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  stockQuantity: number | null;
  imageUrl: string | null;
  active: boolean;
  productType: "physical" | "digital";
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  totalCents: number;
  shippingPriceCents: number;
  addressId: number | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerCpf: string | null;
  paymentMethod: string | null;
  paymentId: string | null;
  adminNotes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  createdAt: Date | null;
}

export interface Address {
  id: number;
  userId: number;
  recipientName: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  isDefault: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Shipment {
  id: number;
  orderId: number;
  shippingMethod: string;
  shippingPriceCents: number;
  trackingCode: string | null;
  trackingUrl: string | null;
  status: string;
  estimatedDelivery: Date | null;
  postedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertOrder {
  userId: number;
  status?: string;
  totalCents: number;
  shippingPriceCents: number;
  addressId?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerCpf?: string | null;
  paymentMethod?: string | null;
  paymentId?: string | null;
}

export interface InsertOrderItem {
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceCents: number;
}

export interface InsertAddress {
  userId: number;
  recipientName: string;
  cep: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export async function getActiveProducts(): Promise<Product[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('active', true);

  if (error) {
    console.error("[Database] Error fetching active products:", error);
    return [];
  }

  return (data || []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error("[Database] Error fetching product by slug:", error);
    }
    return null;
  }

  return data as Product;
}

export async function getProductById(id: number): Promise<Product | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .limit(1)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error("[Database] Error fetching product by id:", error);
    }
    return null;
  }

  return data as Product;
}

export async function createOrder(orderData: InsertOrder): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      ...orderData,
      status: orderData.status || 'AGUARDANDO_PAGAMENTO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating order:", error);
    throw error;
  }

  return data.id;
}

export async function createOrderItems(items: InsertOrderItem[]): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");
  if (items.length === 0) return;

  const itemsWithTimestamp = items.map(item => ({
    ...item,
    createdAt: new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin
    .from('orderItems')
    .insert(itemsWithTimestamp);

  if (error) {
    console.error("[Database] Error creating order items:", error);
    throw error;
  }
}

export async function createAddress(addressData: InsertAddress): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data, error } = await supabaseAdmin
    .from('addresses')
    .insert({
      ...addressData,
      isDefault: addressData.isDefault ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating address:", error);
    throw error;
  }

  return data.id;
}

export async function getUserAddresses(userId: number): Promise<Address[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('userId', userId);

  if (error) {
    console.error("[Database] Error fetching user addresses:", error);
    return [];
  }

  return (data || []) as Address[];
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("[Database] Error fetching user orders:", error);
    return [];
  }

  return (data || []) as Order[];
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .limit(1)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error("[Database] Error fetching order:", error);
    }
    return null;
  }

  return data as Order;
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('orderItems')
    .select('*')
    .eq('orderId', orderId);

  if (error) {
    console.error("[Database] Error fetching order items:", error);
    return [];
  }

  return (data || []) as OrderItem[];
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
): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error("[Database] Error updating user profile:", error);
    throw error;
  }
}

export async function getUserById(userId: number) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .limit(1)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error("[Database] Error fetching user:", error);
    }
    return null;
  }

  return data;
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
): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Verify address belongs to user
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .single();

  if (fetchError || !existing || existing.userId !== userId) {
    throw new Error("Address not found");
  }

  // If setting as default, unset other defaults
  if (data.isDefault) {
    await supabaseAdmin
      .from('addresses')
      .update({ isDefault: false, updatedAt: new Date().toISOString() })
      .eq('userId', userId);
  }

  const { error } = await supabaseAdmin
    .from('addresses')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', addressId);

  if (error) {
    console.error("[Database] Error updating address:", error);
    throw error;
  }
}

export async function deleteAddress(addressId: number, userId: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Verify address belongs to user
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .single();

  if (fetchError || !existing || existing.userId !== userId) {
    throw new Error("Address not found");
  }

  const { error } = await supabaseAdmin
    .from('addresses')
    .delete()
    .eq('id', addressId);

  if (error) {
    console.error("[Database] Error deleting address:", error);
    throw error;
  }
}

// ============================================================
// Order Tracking (Customer Side)
// ============================================================

export async function getOrderWithTracking(orderId: number, userId: number) {
  if (!supabaseAdmin) return null;

  // Get order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order || order.userId !== userId) {
    return null;
  }

  // Get order items
  const { data: items } = await supabaseAdmin
    .from('orderItems')
    .select('*')
    .eq('orderId', orderId);

  // Get shipment
  const { data: shipment } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('orderId', orderId)
    .limit(1)
    .single();

  return {
    ...order,
    items: items || [],
    shipment: shipment || null,
  };
}

export async function decrementProductStock(productId: number, quantity: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const product = await getProductById(productId);
  if (!product) throw new Error("Product not found");

  const currentStock = product.stockQuantity ?? 0;

  if (currentStock < quantity) {
    throw new Error("Insufficient stock");
  }

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      stockQuantity: currentStock - quantity,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) {
    console.error("[Database] Error decrementing stock:", error);
    throw error;
  }
}

// ============================================================
// Creator Product Management
// ============================================================

export async function getCreatorProducts(creatorId: number): Promise<Product[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('creatorId', creatorId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("[Database] Error fetching creator products:", error);
    return [];
  }

  return (data || []) as Product[];
}

export interface InsertProduct {
  creatorId: number;
  productType: "physical" | "digital";
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  compareAtPriceCents?: number | null;
  imageUrl?: string | null;
  stockQuantity?: number | null;
  weightGrams?: number | null;
  widthCm?: string | null;
  heightCm?: string | null;
  depthCm?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
}

export async function createProduct(data: InsertProduct): Promise<Product> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('products')
    .insert({
      ...data,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    console.error("[Database] Error creating product:", error);
    throw error;
  }

  return result as Product;
}

export async function updateProduct(
  productId: number,
  creatorId: number,
  data: Partial<Omit<InsertProduct, 'creatorId' | 'slug'>>
): Promise<Product> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Verify ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('creatorId', creatorId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Produto não encontrado ou você não tem permissão");
  }

  const { data: result, error } = await supabaseAdmin
    .from('products')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', productId)
    .select('*')
    .single();

  if (error) {
    console.error("[Database] Error updating product:", error);
    throw error;
  }

  return result as Product;
}

export async function deleteCreatorProduct(productId: number, creatorId: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Verify ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('id', productId)
    .eq('creatorId', creatorId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Produto não encontrado ou você não tem permissão");
  }

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error("[Database] Error deleting product:", error);
    throw error;
  }
}

export async function toggleProductActive(productId: number, creatorId: number): Promise<Product> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Verify ownership and get current state
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('creatorId', creatorId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Produto não encontrado ou você não tem permissão");
  }

  const { data: result, error } = await supabaseAdmin
    .from('products')
    .update({
      active: !existing.active,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', productId)
    .select('*')
    .single();

  if (error) {
    console.error("[Database] Error toggling product active:", error);
    throw error;
  }

  return result as Product;
}
