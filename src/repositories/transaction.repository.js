/**
 * Transaction Repository - Acceso a datos para Transaction y Donation
 */

import prisma from "../config/prisma.js";

export async function create(data) {
  return await prisma.transaction.create({ data });
}

export async function findByMetadata(key, value) {
  return await prisma.transaction.findFirst({
    where: { metadata: { path: [key], equals: value } },
  });
}

export async function update(id, data) {
  return await prisma.transaction.update({ where: { id }, data });
}

export async function updateManyByMetadata(key, value, data) {
  return await prisma.transaction.updateMany({
    where: {
      metadata: { path: [key], equals: value },
      status: 'COMPLETED'
    },
    data,
  });
}

export async function findByUser(userId) {
  return await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDonation(data) {
  return await prisma.donation.create({ data });
}

// Aliases for backward compatibility
export async function createTransaction(data) {
  return await create(data);
}

export async function findTransactionBySessionId(sessionId) {
  return await findByMetadata('stripeCheckoutSessionId', sessionId);
}

export async function updateTransaction(id, data) {
  return await update(id, data);
}

export async function updateManyTransactions(where, data) {
  return await prisma.transaction.updateMany({ where, data });
}

export async function findTransactionsByUser(userId) {
  return await findByUser(userId);
}
