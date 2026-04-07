import { describe, it, expect } from "vitest";
import prisma from "../../config/prisma.js";
import * as transactionRepo from "../../repositories/transaction.repository.js";

describe("Transaction Repository", () => {

  describe("createTransaction", () => {
    it("crea transacción", async () => {
      const data = { userId: "u1", type: "SUBSCRIPTION", amount: 9.99, currency: "usd", status: "PENDING" };
      prisma.transaction.create.mockResolvedValue({ id: "t1", ...data });
      const result = await transactionRepo.createTransaction(data);
      expect(prisma.transaction.create).toHaveBeenCalledWith({ data });
      expect(result.id).toBe("t1");
    });
  });

  describe("findTransactionBySessionId", () => {
    it("busca transacción por session ID de Stripe", async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: "t1", status: "PENDING" });
      const result = await transactionRepo.findTransactionBySessionId("sess_123");
      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        where: { metadata: { path: ["stripeCheckoutSessionId"], equals: "sess_123" } },
      });
      expect(result.id).toBe("t1");
    });

    it("retorna null si no existe", async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);
      expect(await transactionRepo.findTransactionBySessionId("no-existe")).toBeNull();
    });
  });

  describe("updateTransaction", () => {
    it("actualiza transacción", async () => {
      prisma.transaction.update.mockResolvedValue({ id: "t1", status: "COMPLETED" });
      const result = await transactionRepo.updateTransaction("t1", { status: "COMPLETED" });
      expect(prisma.transaction.update).toHaveBeenCalledWith({ where: { id: "t1" }, data: { status: "COMPLETED" } });
      expect(result.status).toBe("COMPLETED");
    });
  });

  describe("updateManyTransactions", () => {
    it("actualiza múltiples transacciones", async () => {
      prisma.transaction.updateMany.mockResolvedValue({ count: 2 });
      const result = await transactionRepo.updateManyTransactions({ status: "COMPLETED" }, { status: "CANCELED" });
      expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { status: "COMPLETED" },
        data: { status: "CANCELED" },
      });
      expect(result.count).toBe(2);
    });
  });

  describe("findTransactionsByUser", () => {
    it("retorna transacciones del usuario ordenadas por fecha", async () => {
      prisma.transaction.findMany.mockResolvedValue([{ id: "t1" }, { id: "t2" }]);
      const result = await transactionRepo.findTransactionsByUser("u1");
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: "u1" },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe("createDonation", () => {
    it("crea donación", async () => {
      const data = { donatorId: "u1", recipientId: "u2", storyId: "s1", amount: 50 };
      prisma.donation.create.mockResolvedValue({ id: "d1", ...data });
      const result = await transactionRepo.createDonation(data);
      expect(prisma.donation.create).toHaveBeenCalledWith({ data });
      expect(result.id).toBe("d1");
    });
  });
});
