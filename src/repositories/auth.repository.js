/**
 * Auth Repository - Acceso a datos para RefreshToken y PasswordReset
 */

import prisma from "../config/prisma.js";

// --- RefreshToken ---

export async function findRefreshTokenByHash(tokenHash) {
  return await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });
}

export async function createRefreshToken(data) {
  return await prisma.refreshToken.create({ data });
}

export async function updateRefreshToken(tokenHash, data) {
  return await prisma.refreshToken.update({
    where: { tokenHash },
    data,
  });
}

// --- PasswordReset ---

export async function findPasswordReset(where) {
  return await prisma.passwordReset.findFirst({ where });
}

export async function createPasswordReset(data) {
  return await prisma.passwordReset.create({ data });
}

export async function updatePasswordReset(id, data) {
  return await prisma.passwordReset.update({
    where: { id },
    data,
  });
}
