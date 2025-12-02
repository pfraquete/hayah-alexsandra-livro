import { describe, expect, it, vi, beforeEach } from "vitest";
import { z } from "zod";

// Mock the database functions
vi.mock("./db-products", () => ({
  getActiveProducts: vi.fn(),
  getProductBySlug: vi.fn(),
  getProductById: vi.fn(),
  createOrder: vi.fn(),
  createOrderItems: vi.fn(),
  createAddress: vi.fn(),
  getUserAddresses: vi.fn(),
  getUserOrders: vi.fn(),
  getOrderById: vi.fn(),
  getOrderItems: vi.fn(),
  decrementProductStock: vi.fn(),
}));

// Mock the payment and email services
vi.mock("./services/pagarme", () => ({
  createPixPayment: vi.fn(),
  createBoletoPayment: vi.fn(),
  createCreditCardPayment: vi.fn(),
  isPagarmeConfigured: vi.fn(() => false),
}));

vi.mock("./services/email", () => ({
  sendEmail: vi.fn(() => Promise.resolve({ success: true })),
  orderConfirmationEmail: vi.fn(() => ({
    subject: "Test",
    html: "<p>Test</p>",
    text: "Test",
  })),
}));

import {
  getActiveProducts,
  getProductById,
  createOrder,
  createOrderItems,
  createAddress,
  getUserOrders,
  getOrderById,
  getOrderItems,
  decrementProductStock,
} from "./db-products";
import { createPixPayment } from "./services/pagarme";
import { sendEmail } from "./services/email";
import { productsRouter, checkoutRouter, ordersRouter } from "./routers-products";
import type { TrpcContext } from "./_core/context";

// Helper to create a mock context
function createMockContext(user?: TrpcContext["user"]): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("productsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return active products", async () => {
      const mockProducts = [
        { id: 1, name: "Product 1", slug: "product-1", priceCents: 5000 },
        { id: 2, name: "Product 2", slug: "product-2", priceCents: 7500 },
      ];

      vi.mocked(getActiveProducts).mockResolvedValue(mockProducts as any);

      const ctx = createMockContext();
      const caller = productsRouter.createCaller(ctx);
      const result = await caller.list();

      expect(getActiveProducts).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });
});

describe("checkoutRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateShipping", () => {
    it("should return shipping options for valid CEP", async () => {
      const mockProduct = {
        id: 1,
        name: "Test Book",
        slug: "test-book",
        priceCents: 5000,
        active: true,
        stockQuantity: 10,
        weightGrams: 300,
        widthCm: "14",
        heightCm: "21",
        depthCm: "2",
      };
      
      vi.mocked(getProductById).mockResolvedValue(mockProduct as any);
      
      const ctx = createMockContext();
      const caller = checkoutRouter.createCaller(ctx);

      const result = await caller.calculateShipping({
        cep: "01234567",
        productId: 1,
        quantity: 1,
      });

      expect(result.options).toHaveLength(2);
      expect(result.options[0].name).toBe("PAC - Correios");
      expect(result.options[1].name).toBe("SEDEX - Correios");
      expect(result.options[0].priceCents).toBeLessThan(result.options[1].priceCents);
    });
  });

  describe("createOrder", () => {
    const mockUser = {
      id: 1,
      openId: "user-123",
      email: "test@example.com",
      name: "Test User",
      cpf: "12345678901",
      phone: null,
      loginMethod: "email",
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const mockProduct = {
      id: 1,
      name: "Test Book",
      slug: "test-book",
      priceCents: 5000,
      active: true,
      stockQuantity: 10,
    };

    const validOrderInput = {
      productId: 1,
      quantity: 1,
      shippingMethod: "PAC",
      shippingPriceCents: 1500,
      address: {
        recipientName: "João Silva",
        cep: "01234567",
        street: "Rua das Flores",
        number: "123",
        complement: "Apto 45",
        district: "Centro",
        city: "São Paulo",
        state: "SP",
      },
      paymentMethod: "pix" as const,
    };

    it("should create order successfully with PIX payment", async () => {
      vi.mocked(getProductById).mockResolvedValue(mockProduct as any);
      vi.mocked(decrementProductStock).mockResolvedValue(undefined);
      vi.mocked(createAddress).mockResolvedValue(1);
      vi.mocked(createOrder).mockResolvedValue(100);
      vi.mocked(createOrderItems).mockResolvedValue(undefined);
      vi.mocked(createPixPayment).mockResolvedValue({
        success: true,
        transactionId: "pix_123",
        status: "pending",
        pixQrCode: "00020126...",
        pixQrCodeUrl: "https://example.com/qr.png",
      });

      const ctx = createMockContext(mockUser);
      const caller = checkoutRouter.createCaller(ctx);

      const result = await caller.createOrder(validOrderInput);

      expect(result.orderId).toBe(100);
      expect(result.totalCents).toBe(6500); // 5000 + 1500
      expect(result.payment?.status).toBe("pending");
      expect(createPixPayment).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });

    it("should throw error for inactive product", async () => {
      vi.mocked(getProductById).mockResolvedValue({
        ...mockProduct,
        active: false,
      } as any);

      const ctx = createMockContext(mockUser);
      const caller = checkoutRouter.createCaller(ctx);

      await expect(caller.createOrder(validOrderInput)).rejects.toThrow(
        "Produto não disponível para venda"
      );
    });

    it("should throw error for non-existent product", async () => {
      vi.mocked(getProductById).mockResolvedValue(null);

      const ctx = createMockContext(mockUser);
      const caller = checkoutRouter.createCaller(ctx);

      await expect(caller.createOrder(validOrderInput)).rejects.toThrow(
        "Produto não encontrado"
      );
    });

    it("should throw error for unauthenticated user", async () => {
      const ctx = createMockContext(); // No user
      const caller = checkoutRouter.createCaller(ctx);

      await expect(caller.createOrder(validOrderInput)).rejects.toThrow();
    });
  });
});

describe("ordersRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    openId: "user-123",
    email: "test@example.com",
    name: "Test User",
    cpf: null,
    phone: null,
    loginMethod: "email",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  describe("myOrders", () => {
    it("should return user orders", async () => {
      const mockOrders = [
        { id: 1, userId: 1, totalCents: 5000, status: "PAGO" },
        { id: 2, userId: 1, totalCents: 7500, status: "ENTREGUE" },
      ];

      vi.mocked(getUserOrders).mockResolvedValue(mockOrders as any);

      const ctx = createMockContext(mockUser);
      const caller = ordersRouter.createCaller(ctx);

      const result = await caller.myOrders();

      expect(getUserOrders).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrders);
    });
  });

  describe("getById", () => {
    it("should return order with items for valid order", async () => {
      const mockOrder = { id: 1, userId: 1, totalCents: 5000 };
      const mockItems = [
        { id: 1, orderId: 1, productName: "Book", quantity: 1 },
      ];

      vi.mocked(getOrderById).mockResolvedValue(mockOrder as any);
      vi.mocked(getOrderItems).mockResolvedValue(mockItems as any);

      const ctx = createMockContext(mockUser);
      const caller = ordersRouter.createCaller(ctx);

      const result = await caller.getById({ id: 1 });

      expect(result.id).toBe(1);
      expect(result.items).toEqual(mockItems);
    });

    it("should throw error for order belonging to another user", async () => {
      vi.mocked(getOrderById).mockResolvedValue({
        id: 1,
        userId: 999, // Different user
        totalCents: 5000,
      } as any);

      const ctx = createMockContext(mockUser);
      const caller = ordersRouter.createCaller(ctx);

      await expect(caller.getById({ id: 1 })).rejects.toThrow(
        "Pedido não encontrado"
      );
    });

    it("should throw error for non-existent order", async () => {
      vi.mocked(getOrderById).mockResolvedValue(null);

      const ctx = createMockContext(mockUser);
      const caller = ordersRouter.createCaller(ctx);

      await expect(caller.getById({ id: 999 })).rejects.toThrow(
        "Pedido não encontrado"
      );
    });
  });
});
