import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../repositories/user.repository.js", () => ({
  findById: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../../repositories/transaction.repository.js", () => ({
  create: vi.fn(),
  findByMetadata: vi.fn(),
  update: vi.fn(),
  updateManyByMetadata: vi.fn(),
  findByUser: vi.fn(),
}));

import * as transactionRepo from "../../repositories/transaction.repository.js";
import {
  getUserTransactions,
  getSubscriptionPlans,
  getCoinPacks,
} from "../../features/transactions/transaction.service.js";

describe("transaction.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna transacciones del usuario", async () => {
    const rows = [{ id: "tx-1" }, { id: "tx-2" }];
    transactionRepo.findByUser.mockResolvedValue(rows);

    const result = await getUserTransactions("user-1");

    expect(transactionRepo.findByUser).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ transactions: rows });
  });

  it("retorna planes de suscripción configurados", async () => {
    const result = await getSubscriptionPlans();

    expect(result).toHaveProperty("plans");
    expect(Array.isArray(result.plans)).toBe(true);
    expect(result.plans.length).toBeGreaterThan(0);
  });

  it("retorna packs de monedas configurados", async () => {
    const result = await getCoinPacks();

    expect(result).toHaveProperty("packs");
    expect(Array.isArray(result.packs)).toBe(true);
    expect(result.packs.length).toBeGreaterThan(0);
  });
});
