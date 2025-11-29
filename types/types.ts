// ============================================================================
// HAYAH ALEXSANDRA LIVRO - TIPOS TYPESCRIPT
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export type OrderStatus =
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGO'
  | 'EM_SEPARACAO'
  | 'POSTADO'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'CANCELADO'
  | 'REEMBOLSADO'
  | 'PROBLEMA';

export type ShipmentStatus =
  | 'PENDENTE'
  | 'ETIQUETA_GERADA'
  | 'POSTADO'
  | 'EM_TRANSITO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'DEVOLVIDO'
  | 'EXTRAVIADO';

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export type AddressType = 'shipping' | 'billing';

export type MessageDirection = 'in' | 'out';

export type UserRole = 'customer' | 'admin';

export type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'authorized'
  | 'paid'
  | 'refused'
  | 'refunded'
  | 'chargedback'
  | 'failed';

// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password_hash?: string;
  role: UserRole;
  avatar_url?: string;
  email_verified_at?: string;
  phone_verified_at?: string;
  source: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku: string;
  price_cents: number;
  compare_at_price_cents?: number;
  stock_quantity: number;
  stock_minimum: number;
  track_stock: boolean;
  weight_grams: number;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  image_url?: string;
  images: string[];
  active: boolean;
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: AddressType;
  label?: string;
  recipient_name?: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country: string;
  reference?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: number;
  user_id: string;
  address_id: string;
  subtotal_cents: number;
  shipping_price_cents: number;
  discount_cents: number;
  total_cents: number;
  coupon_code?: string;
  coupon_discount_cents: number;
  status: OrderStatus;
  payment_method?: PaymentMethod;
  customer_notes?: string;
  admin_notes?: string;
  shipping_address: ShippingAddressSnapshot;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  product_name: string;
  product_sku: string;
  created_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  shipping_method: string;
  shipping_service_code?: string;
  shipping_price_cents: number;
  tracking_code?: string;
  tracking_url?: string;
  status: ShipmentStatus;
  label_url?: string;
  label_generated_at?: string;
  estimated_delivery?: string;
  posted_at?: string;
  delivered_at?: string;
  carrier: string;
  carrier_response?: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  external_id?: string;
  provider: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount_cents: number;
  refunded_amount_cents: number;
  installments: number;
  installment_value_cents?: number;
  pix_qr_code?: string;
  pix_qr_code_url?: string;
  pix_copy_paste?: string;
  pix_expiration?: string;
  card_last_digits?: string;
  card_brand?: string;
  card_holder_name?: string;
  boleto_url?: string;
  boleto_barcode?: string;
  boleto_expiration?: string;
  raw_request?: any;
  raw_response?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  refunded_at?: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status?: OrderStatus;
  to_status: OrderStatus;
  notes?: string;
  created_by?: string;
  created_by_system: boolean;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: MovementType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reason?: string;
  order_id?: string;
  created_by?: string;
  created_at: string;
}

export interface WhatsAppConversation {
  id: string;
  user_id?: string;
  phone: string;
  unread_count: number;
  is_archived: boolean;
  last_message_at?: string;
  last_message_preview?: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  order_id?: string;
  direction: MessageDirection;
  content: string;
  template_name?: string;
  template_variables?: any;
  external_id?: string;
  status: string;
  raw_payload?: any;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
}

export interface EmailLog {
  id: string;
  user_id?: string;
  order_id?: string;
  to_email: string;
  from_email: string;
  subject: string;
  template_name: string;
  template_variables?: any;
  status: string;
  external_id?: string;
  raw_response?: any;
  error_message?: string;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_cents: number;
  max_discount_cents?: number;
  usage_limit?: number;
  usage_per_user: number;
  usage_count: number;
  starts_at: string;
  expires_at?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  type: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SNAPSHOTS (Dados salvos no momento da compra)
// ============================================================================

export interface ShippingAddressSnapshot {
  recipient_name: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Checkout
export interface CreateOrderRequest {
  customer: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    password?: string;
  };
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
  };
  shipping: {
    method: string;
    price_cents: number;
  };
  items: {
    product_id: string;
    quantity: number;
  }[];
  customer_notes?: string;
}

export interface ProcessPaymentRequest {
  order_id: string;
  payment_method: PaymentMethod;
  card?: {
    number: string;
    holder_name: string;
    expiration_date: string; // MMYY
    cvv: string;
  };
  installments?: number;
}

export interface ProcessPaymentResponse {
  success: boolean;
  transaction_id?: string;
  status: PaymentStatus;
  pix?: {
    qr_code: string;
    qr_code_url: string;
    copy_paste: string;
    expires_at: string;
  };
  error?: string;
}

// Shipping
export interface CalculateShippingRequest {
  cep: string;
  products: {
    product_id: string;
    quantity: number;
  }[];
}

export interface ShippingOption {
  service_code: string;
  service_name: string;
  price_cents: number;
  delivery_days: number;
  carrier: string;
}

export interface CalculateShippingResponse {
  options: ShippingOption[];
}

// Admin Dashboard
export interface DashboardMetrics {
  total_orders: number;
  paid_orders: number;
  delivered_orders: number;
  total_revenue_cents: number;
  average_order_cents: number;
  orders_today: number;
  revenue_today_cents: number;
  orders_by_day: {
    date: string;
    count: number;
    revenue_cents: number;
  }[];
}

// ============================================================================
// WEBHOOK PAYLOADS
// ============================================================================

export interface PagarmeWebhookPayload {
  id: string;
  current_status: PaymentStatus;
  transaction: {
    id: number;
    status: string;
    amount: number;
    paid_amount: number;
    payment_method: string;
    metadata?: {
      order_id?: string;
    };
  };
}

export interface TwoChatWebhookPayload {
  id: string;
  type: 'message' | 'status';
  from: string;
  to: string;
  body?: string;
  timestamp: string;
  status?: string;
}

// ============================================================================
// UI/FRONTEND TYPES
// ============================================================================

export interface CheckoutStep {
  id: number;
  title: string;
  completed: boolean;
  current: boolean;
}

export interface OrderWithDetails extends Order {
  user: User;
  items: OrderItem[];
  shipment?: Shipment;
  payment?: PaymentTransaction;
  status_history: OrderStatusHistory[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  AGUARDANDO_PAGAMENTO: {
    label: 'Aguardando Pagamento',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: 'Clock',
  },
  PAGO: {
    label: 'Pago',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'CheckCircle',
  },
  EM_SEPARACAO: {
    label: 'Em Separação',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'Package',
  },
  POSTADO: {
    label: 'Postado',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'Send',
  },
  EM_TRANSITO: {
    label: 'Em Trânsito',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: 'Truck',
  },
  ENTREGUE: {
    label: 'Entregue',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    icon: 'CheckCircle2',
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: 'XCircle',
  },
  REEMBOLSADO: {
    label: 'Reembolsado',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: 'RefreshCcw',
  },
  PROBLEMA: {
    label: 'Problema',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: 'AlertTriangle',
  },
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface FilterParams {
  search?: string;
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ============================================================================
// FORM SCHEMAS (para usar com zod)
// ============================================================================

export interface CustomerFormData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AddressFormData {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
}

export interface CardFormData {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
  installments: number;
}
