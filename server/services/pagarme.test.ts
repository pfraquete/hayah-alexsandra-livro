import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  isPagarmeConfigured,
  createPixPayment,
  createBoletoPayment,
  createCreditCardPayment,
} from "./pagarme";

describe("Pagar.me Service", () => {
  describe("isPagarmeConfigured", () => {
    it("should return false when PAGARME_API_KEY is not set", () => {
      // In test environment, API key is not set
      expect(isPagarmeConfigured()).toBe(false);
    });
  });

  describe("createPixPayment (simulation mode)", () => {
    it("should return simulated PIX payment when API key is not configured", async () => {
      const result = await createPixPayment({
        amountCents: 10000,
        customer: {
          name: "João Silva",
          email: "joao@email.com",
          document: "12345678901",
        },
        orderId: "123",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("pending");
      expect(result.transactionId).toContain("sim_pix_");
      expect(result.pixQrCode).toBeDefined();
      expect(result.pixQrCodeUrl).toBeDefined();
    });
  });

  describe("createBoletoPayment (simulation mode)", () => {
    it("should return simulated boleto payment when API key is not configured", async () => {
      const result = await createBoletoPayment({
        amountCents: 15000,
        customer: {
          name: "Maria Santos",
          email: "maria@email.com",
          document: "98765432101",
        },
        billingAddress: {
          street: "Rua das Flores",
          number: "123",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234567",
          country: "BR",
        },
        orderId: "456",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("pending");
      expect(result.transactionId).toContain("sim_boleto_");
      expect(result.boletoUrl).toBeDefined();
      expect(result.boletoBarcode).toBeDefined();
      expect(result.boletoDueDate).toBeDefined();
    });
  });

  describe("createCreditCardPayment (simulation mode)", () => {
    it("should return simulated credit card payment when API key is not configured", async () => {
      const result = await createCreditCardPayment({
        amountCents: 20000,
        card: {
          number: "4111111111111111",
          holderName: "JOAO SILVA",
          expMonth: 12,
          expYear: 2025,
          cvv: "123",
        },
        customer: {
          name: "João Silva",
          email: "joao@email.com",
          document: "12345678901",
        },
        billingAddress: {
          street: "Rua das Flores",
          number: "123",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234567",
          country: "BR",
        },
        orderId: "789",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("authorized");
      expect(result.transactionId).toContain("sim_");
    });
  });
});
