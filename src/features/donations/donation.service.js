import * as userRepo from "../../repositories/user.repository.js";
import * as storyRepo from "../../repositories/story.repository.js";
import * as transactionRepo from "../../repositories/transaction.repository.js";
import prisma from "../../config/prisma.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";

async function makeDonation(donatorId, storyId, amount, message) {
  if (amount <= 0) {
    throw new ValidationError("La cantidad a donar debe ser positiva.");
  }

  const [donator, story] = await Promise.all([
    userRepo.findById(donatorId),
    storyRepo.findById(storyId),
  ]);

  if (!donator)
    throw new NotFoundError("El usuario donador no fue encontrado.");
  if (!story) throw new NotFoundError("La historia no fue encontrada.");

  const recipientId = story.authorId;

  if (donatorId === recipientId) {
    throw new ConflictError("No puedes donarte monedas a ti mismo.");
  }
  if (donator.coins < amount) {
    throw new ValidationError(
      "No tienes suficientes monedas para realizar esta donación.",
    );
  }

  const newDonation = await prisma.$transaction(async (tx) => {
    const currentDonator = await userRepo.findById(donatorId, tx);
    if (!currentDonator) {
      throw new NotFoundError("El usuario donador no fue encontrado.");
    }

    if (currentDonator.coins < amount) {
      throw new ValidationError(
        "No tienes suficientes monedas para realizar esta donación.",
      );
    }

    await userRepo.update(donatorId, { coins: { decrement: amount } }, tx);
    await userRepo.update(recipientId, { coins: { increment: amount } }, tx);

    const donation = await transactionRepo.createDonation(
      {
        donatorId,
        recipientId,
        storyId,
        amount,
        message,
      },
      tx,
    );

    await transactionRepo.create(
      {
        userId: donatorId,
        type: "DONATION",
        amount: amount,
        currency: "coins",
        status: "COMPLETED",
        metadata: {
          recipientId,
          storyId,
        },
      },
      tx,
    );

    return donation;
  });

  return { success: true, donation: newDonation };
}

export { makeDonation };
