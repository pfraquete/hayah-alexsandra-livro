import { describe, expect, it, vi } from "vitest";
import {
  isEmailConfigured,
  sendEmail,
  orderConfirmationEmail,
  orderStatusUpdateEmail,
  passwordResetEmail,
} from "./email";

describe("Email Service", () => {
  describe("isEmailConfigured", () => {
    it("should return false when no email provider is configured", () => {
      // In test environment, no API keys are set
      expect(isEmailConfigured()).toBe(false);
    });
  });

  describe("sendEmail (development mode)", () => {
    it("should return success in development mode without sending", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
        text: "Test content",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toContain("dev_");
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("orderConfirmationEmail", () => {
    it("should generate correct order confirmation email", () => {
      const email = orderConfirmationEmail({
        customerName: "João Silva",
        orderId: 123,
        items: [
          { name: "Mulher Sábia, Vida Próspera", quantity: 2, priceCents: 8990 },
        ],
        subtotalCents: 17980,
        shippingCents: 1500,
        totalCents: 19480,
        shippingAddress: {
          street: "Rua das Flores",
          number: "123",
          complement: "Apto 45",
          district: "Centro",
          city: "São Paulo",
          state: "SP",
          cep: "01234-567",
        },
        paymentMethod: "pix",
      });

      expect(email.subject).toBe("Pedido #123 confirmado - Hayah Livros");
      expect(email.html).toContain("João Silva");
      expect(email.html).toContain("#123");
      expect(email.html).toContain("Mulher Sábia, Vida Próspera");
      expect(email.html).toContain("R$ 194,80"); // Total
      expect(email.html).toContain("PIX");
      expect(email.html).toContain("Rua das Flores");
      expect(email.text).toContain("João Silva");
      expect(email.text).toContain("#123");
    });

    it("should handle address without complement", () => {
      const email = orderConfirmationEmail({
        customerName: "Maria",
        orderId: 456,
        items: [{ name: "Book", quantity: 1, priceCents: 5000 }],
        subtotalCents: 5000,
        shippingCents: 1000,
        totalCents: 6000,
        shippingAddress: {
          street: "Av. Principal",
          number: "100",
          district: "Bairro",
          city: "Rio",
          state: "RJ",
          cep: "20000-000",
        },
        paymentMethod: "credit_card",
      });

      expect(email.html).not.toContain("undefined");
      expect(email.html).toContain("Cartão de Crédito");
    });
  });

  describe("orderStatusUpdateEmail", () => {
    it("should generate email for payment confirmed status", () => {
      const email = orderStatusUpdateEmail({
        customerName: "João",
        orderId: 789,
        status: "PAGO",
      });

      expect(email.subject).toContain("Pagamento Confirmado");
      expect(email.html).toContain("Pagamento Confirmado");
      expect(email.html).toContain("seu pedido está sendo preparado");
    });

    it("should generate email for shipped status with tracking", () => {
      const email = orderStatusUpdateEmail({
        customerName: "Maria",
        orderId: 101,
        status: "POSTADO",
        trackingCode: "BR123456789",
        trackingUrl: "https://track.correios.com.br/BR123456789",
      });

      expect(email.subject).toContain("Enviado");
      expect(email.html).toContain("BR123456789");
      expect(email.html).toContain("https://track.correios.com.br/BR123456789");
    });

    it("should generate email for delivered status", () => {
      const email = orderStatusUpdateEmail({
        customerName: "Pedro",
        orderId: 202,
        status: "ENTREGUE",
      });

      expect(email.subject).toContain("Entregue");
      expect(email.html).toContain("foi entregue");
    });

    it("should generate email for cancelled status", () => {
      const email = orderStatusUpdateEmail({
        customerName: "Ana",
        orderId: 303,
        status: "CANCELADO",
      });

      expect(email.subject).toContain("Cancelado");
      expect(email.html).toContain("foi cancelado");
    });
  });

  describe("passwordResetEmail", () => {
    it("should generate password reset email with link", () => {
      const email = passwordResetEmail({
        customerName: "João",
        resetLink: "https://hayahlivros.com.br/reset?token=abc123",
      });

      expect(email.subject).toBe("Recuperação de Senha - Hayah Livros");
      expect(email.html).toContain("João");
      expect(email.html).toContain("https://hayahlivros.com.br/reset?token=abc123");
      expect(email.html).toContain("Redefinir Senha");
      expect(email.text).toContain("https://hayahlivros.com.br/reset?token=abc123");
    });
  });
});
