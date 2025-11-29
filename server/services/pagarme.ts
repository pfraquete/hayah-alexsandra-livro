/**
 * Pagar.me Payment Gateway Integration
 * Documentation: https://docs.pagar.me/reference
 */

import { z } from "zod";

// Environment variables for Pagar.me
const PAGARME_API_KEY = process.env.PAGARME_API_KEY;
const PAGARME_API_URL = process.env.PAGARME_API_URL || "https://api.pagar.me/core/v5";

// Validation schemas
export const creditCardSchema = z.object({
  number: z.string().min(13).max(19),
  holderName: z.string().min(3),
  expMonth: z.number().min(1).max(12),
  expYear: z.number().min(2024),
  cvv: z.string().length(3),
});

export const customerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  document: z.string().min(11).max(14), // CPF or CNPJ
  phone: z.string().optional(),
});

export const addressSchema = z.object({
  street: z.string(),
  number: z.string(),
  complement: z.string().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zipCode: z.string().length(8),
  country: z.string().default("BR"),
});

// Types
export type CreditCard = z.infer<typeof creditCardSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type Address = z.infer<typeof addressSchema>;

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: "pending" | "processing" | "authorized" | "paid" | "refused" | "refunded" | "canceled";
  message?: string;
  pixQrCode?: string;
  pixQrCodeUrl?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  boletoDueDate?: string;
}

interface PagarmeError {
  message: string;
  type: string;
}

/**
 * Check if Pagar.me is configured
 */
export function isPagarmeConfigured(): boolean {
  return !!PAGARME_API_KEY;
}

/**
 * Make authenticated request to Pagar.me API
 */
async function pagarmeRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  if (!PAGARME_API_KEY) {
    throw new Error("Pagar.me API key not configured");
  }

  const response = await fetch(`${PAGARME_API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${PAGARME_API_KEY}:`).toString("base64")}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as PagarmeError;
    throw new Error(error.message || "Pagar.me API error");
  }

  return data as T;
}

/**
 * Create a credit card payment
 */
export async function createCreditCardPayment(params: {
  amountCents: number;
  card: CreditCard;
  customer: Customer;
  billingAddress: Address;
  orderId: string;
  installments?: number;
}): Promise<PaymentResult> {
  if (!isPagarmeConfigured()) {
    // Simulated response for development
    console.warn("[Pagar.me] Running in simulation mode - no API key configured");
    return {
      success: true,
      transactionId: `sim_${Date.now()}`,
      status: "authorized",
      message: "Pagamento simulado - ambiente de desenvolvimento",
    };
  }

  try {
    const response = await pagarmeRequest<any>("/orders", "POST", {
      items: [
        {
          amount: params.amountCents,
          description: `Pedido #${params.orderId}`,
          quantity: 1,
          code: params.orderId,
        },
      ],
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        document: params.customer.document,
        type: params.customer.document.length > 11 ? "company" : "individual",
        phones: params.customer.phone
          ? {
              mobile_phone: {
                country_code: "55",
                area_code: params.customer.phone.substring(0, 2),
                number: params.customer.phone.substring(2),
              },
            }
          : undefined,
      },
      payments: [
        {
          payment_method: "credit_card",
          credit_card: {
            installments: params.installments || 1,
            card: {
              number: params.card.number,
              holder_name: params.card.holderName,
              exp_month: params.card.expMonth,
              exp_year: params.card.expYear,
              cvv: params.card.cvv,
              billing_address: {
                line_1: `${params.billingAddress.number}, ${params.billingAddress.street}`,
                line_2: params.billingAddress.complement,
                zip_code: params.billingAddress.zipCode,
                city: params.billingAddress.city,
                state: params.billingAddress.state,
                country: params.billingAddress.country,
              },
            },
          },
        },
      ],
    });

    return {
      success: response.status === "paid" || response.status === "authorized",
      transactionId: response.id,
      status: mapPagarmeStatus(response.status),
      message: response.status === "paid" ? "Pagamento aprovado" : "Pagamento em processamento",
    };
  } catch (error) {
    console.error("[Pagar.me] Credit card payment error:", error);
    return {
      success: false,
      status: "refused",
      message: error instanceof Error ? error.message : "Erro ao processar pagamento",
    };
  }
}

/**
 * Create a PIX payment
 */
export async function createPixPayment(params: {
  amountCents: number;
  customer: Customer;
  orderId: string;
  expiresInMinutes?: number;
}): Promise<PaymentResult> {
  if (!isPagarmeConfigured()) {
    // Simulated response for development
    console.warn("[Pagar.me] Running in simulation mode - no API key configured");
    return {
      success: true,
      transactionId: `sim_pix_${Date.now()}`,
      status: "pending",
      message: "PIX simulado - ambiente de desenvolvimento",
      pixQrCode: "00020126580014br.gov.bcb.pix0136exemplo-pix-simulado",
      pixQrCodeUrl: "https://via.placeholder.com/200x200?text=QR+Code+PIX",
    };
  }

  try {
    const response = await pagarmeRequest<any>("/orders", "POST", {
      items: [
        {
          amount: params.amountCents,
          description: `Pedido #${params.orderId}`,
          quantity: 1,
          code: params.orderId,
        },
      ],
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        document: params.customer.document,
        type: params.customer.document.length > 11 ? "company" : "individual",
      },
      payments: [
        {
          payment_method: "pix",
          pix: {
            expires_in: (params.expiresInMinutes || 30) * 60, // Convert to seconds
          },
        },
      ],
    });

    const pixCharge = response.charges?.[0]?.last_transaction;

    return {
      success: true,
      transactionId: response.id,
      status: "pending",
      message: "PIX gerado com sucesso",
      pixQrCode: pixCharge?.qr_code,
      pixQrCodeUrl: pixCharge?.qr_code_url,
    };
  } catch (error) {
    console.error("[Pagar.me] PIX payment error:", error);
    return {
      success: false,
      status: "refused",
      message: error instanceof Error ? error.message : "Erro ao gerar PIX",
    };
  }
}

/**
 * Create a Boleto payment
 */
export async function createBoletoPayment(params: {
  amountCents: number;
  customer: Customer;
  billingAddress: Address;
  orderId: string;
  dueDays?: number;
}): Promise<PaymentResult> {
  if (!isPagarmeConfigured()) {
    // Simulated response for development
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (params.dueDays || 3));

    console.warn("[Pagar.me] Running in simulation mode - no API key configured");
    return {
      success: true,
      transactionId: `sim_boleto_${Date.now()}`,
      status: "pending",
      message: "Boleto simulado - ambiente de desenvolvimento",
      boletoUrl: "https://via.placeholder.com/800x400?text=Boleto+Simulado",
      boletoBarcode: "23793.38128 60000.000003 00000.000400 1 84340000012345",
      boletoDueDate: dueDate.toISOString(),
    };
  }

  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (params.dueDays || 3));

    const response = await pagarmeRequest<any>("/orders", "POST", {
      items: [
        {
          amount: params.amountCents,
          description: `Pedido #${params.orderId}`,
          quantity: 1,
          code: params.orderId,
        },
      ],
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        document: params.customer.document,
        type: params.customer.document.length > 11 ? "company" : "individual",
        address: {
          line_1: `${params.billingAddress.number}, ${params.billingAddress.street}`,
          line_2: params.billingAddress.complement,
          zip_code: params.billingAddress.zipCode,
          city: params.billingAddress.city,
          state: params.billingAddress.state,
          country: params.billingAddress.country,
        },
      },
      payments: [
        {
          payment_method: "boleto",
          boleto: {
            due_at: dueDate.toISOString(),
            instructions: "Não receber após o vencimento",
          },
        },
      ],
    });

    const boletoCharge = response.charges?.[0]?.last_transaction;

    return {
      success: true,
      transactionId: response.id,
      status: "pending",
      message: "Boleto gerado com sucesso",
      boletoUrl: boletoCharge?.pdf,
      boletoBarcode: boletoCharge?.line,
      boletoDueDate: boletoCharge?.due_at,
    };
  } catch (error) {
    console.error("[Pagar.me] Boleto payment error:", error);
    return {
      success: false,
      status: "refused",
      message: error instanceof Error ? error.message : "Erro ao gerar boleto",
    };
  }
}

/**
 * Get order/transaction status
 */
export async function getOrderStatus(orderId: string): Promise<PaymentResult> {
  if (!isPagarmeConfigured()) {
    return {
      success: true,
      transactionId: orderId,
      status: "pending",
      message: "Status simulado",
    };
  }

  try {
    const response = await pagarmeRequest<any>(`/orders/${orderId}`);

    return {
      success: true,
      transactionId: response.id,
      status: mapPagarmeStatus(response.status),
    };
  } catch (error) {
    console.error("[Pagar.me] Get order status error:", error);
    return {
      success: false,
      status: "pending",
      message: error instanceof Error ? error.message : "Erro ao consultar status",
    };
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(orderId: string, amountCents?: number): Promise<PaymentResult> {
  if (!isPagarmeConfigured()) {
    return {
      success: true,
      transactionId: orderId,
      status: "refunded",
      message: "Reembolso simulado",
    };
  }

  try {
    const response = await pagarmeRequest<any>(`/orders/${orderId}/refund`, "POST", {
      amount: amountCents,
    });

    return {
      success: true,
      transactionId: response.id,
      status: "refunded",
      message: "Reembolso processado com sucesso",
    };
  } catch (error) {
    console.error("[Pagar.me] Refund error:", error);
    return {
      success: false,
      status: "pending",
      message: error instanceof Error ? error.message : "Erro ao processar reembolso",
    };
  }
}

/**
 * Map Pagar.me status to our internal status
 */
function mapPagarmeStatus(
  pagarmeStatus: string
): PaymentResult["status"] {
  const statusMap: Record<string, PaymentResult["status"]> = {
    pending: "pending",
    processing: "processing",
    authorized: "authorized",
    paid: "paid",
    failed: "refused",
    refunded: "refunded",
    canceled: "canceled",
    voided: "canceled",
  };

  return statusMap[pagarmeStatus] || "pending";
}
