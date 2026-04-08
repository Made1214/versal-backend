import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";

vi.mock("../../repositories/user.repository.js", () => ({
  findById: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../../repositories/story.repository.js", () => ({
  findById: vi.fn(),
}));

vi.mock("../../repositories/transaction.repository.js", () => ({
  createDonation: vi.fn(),
  create: vi.fn(),
}));

vi.mock("../../config/prisma.js", () => ({
  default: {
    $transaction: vi.fn(),
  },
}));

import prisma from "../../config/prisma.js";
import * as userRepo from "../../repositories/user.repository.js";
import * as storyRepo from "../../repositories/story.repository.js";
import * as transactionRepo from "../../repositories/transaction.repository.js";
import { makeDonation } from "../../features/donations/donation.service.js";

describe("donation.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.$transaction.mockImplementation(async (cb) => cb({}));
  });

  it("realiza donación y registra transacción", async () => {
    userRepo.findById
      .mockResolvedValueOnce({ id: "donator-1", coins: 100 })
      .mockResolvedValueOnce({ id: "donator-1", coins: 100 });
    storyRepo.findById.mockResolvedValue({
      id: "story-1",
      authorId: "author-1",
    });
    userRepo.update.mockResolvedValue({});
    transactionRepo.createDonation.mockResolvedValue({ id: "donation-1" });
    transactionRepo.create.mockResolvedValue({ id: "txn-1" });

    const result = await makeDonation("donator-1", "story-1", 20, "Gracias");

    expect(result.success).toBe(true);
    expect(transactionRepo.createDonation).toHaveBeenCalledWith(
      expect.objectContaining({
        donatorId: "donator-1",
        recipientId: "author-1",
        storyId: "story-1",
        amount: 20,
      }),
      expect.any(Object),
    );
    expect(transactionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "donator-1",
        type: "DONATION",
        status: "COMPLETED",
      }),
      expect.any(Object),
    );
  });

  it("lanza ValidationError cuando amount es inválido", async () => {
    await expect(makeDonation("u1", "s1", 0)).rejects.toThrow(ValidationError);
  });

  it("lanza NotFoundError si no existe donador", async () => {
    userRepo.findById.mockResolvedValueOnce(null);
    storyRepo.findById.mockResolvedValue({
      id: "story-1",
      authorId: "author-1",
    });

    await expect(makeDonation("u1", "story-1", 10)).rejects.toThrow(
      NotFoundError,
    );
  });

  it("lanza ConflictError si intenta donarse a sí mismo", async () => {
    userRepo.findById.mockResolvedValueOnce({ id: "u1", coins: 100 });
    storyRepo.findById.mockResolvedValue({ id: "story-1", authorId: "u1" });

    await expect(makeDonation("u1", "story-1", 10)).rejects.toThrow(
      ConflictError,
    );
  });
});
