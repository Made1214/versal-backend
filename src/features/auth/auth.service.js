import crypto from "crypto";
import * as userService from "../users/user.service.js";
import * as authRepo from "../../repositories/auth.repository.js";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from "../../utils/errors.js";

// Registra usuario usando userService.
// - Comprueba que el email no exista y no esté eliminado.
// - Devuelve objeto user (sin password) o lanza error.
async function registerUser({ email, password, username, fullName }) {
  const existing = await userService.getUserByEmail(email, true);
  if (existing) {
    if (existing.isDeleted) {
      throw new ConflictError(
        "El email ya estaba asociado a una cuenta eliminada. Ponte en contacto con soporte si quieres recuperarla.",
      );
    }
    throw new ConflictError("El email ya está en uso.");
  }

  if (!userService.isValidEmail(email)) {
    throw new ValidationError("El email no es válido.");
  }

  const result = await userService.registerUser({
    email,
    password,
    username,
    fullName,
  });

  return result.user;
}

// Login de usuario.
// - Comprueba user activo (no isDeleted) y credenciales.
// - Devuelve user seguro (sin password) o lanza error.
async function loginUser({ email, password }) {
  const result = await userService.loginUser({ email, password });

  if (!result || result.isDeleted) {
    throw new UnauthorizedError("Credenciales inválidas.");
  }

  return result;
}
async function findOrCreateOAuthUser({
  email,
  fullName,
  profileImage,
  provider,
  oauthId,
}) {
  const result = await userService.findOrCreateOAuthUser({
    email,
    fullName,
    profileImage,
    provider,
    oauthId,
  });

  return result.user;
}
// Genera hash de refresh token para almacenamiento seguro.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Guarda un refreshToken en base de datos.
async function saveRefreshToken({
  token,
  userId,
  userAgent = "unknown",
  expiresAt,
}) {
  const tokenHash = hashToken(token);
  const defaultExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  await authRepo.createRefreshToken({
    tokenHash,
    userId,
    userAgent,
    expiresAt: expiresAt || defaultExpiresAt,
  });
}

// Verifica token de refresh: existe, no revocado y no expirado.
async function verifyRefreshToken(token) {
  const tokenHash = hashToken(token);
  const refreshToken = await authRepo.findRefreshTokenByHash(tokenHash);
  if (!refreshToken) throw new UnauthorizedError("Refresh token inválido.");
  if (refreshToken.revoked)
    throw new UnauthorizedError("Refresh token revocado.");
  if (refreshToken.expiresAt < new Date())
    throw new UnauthorizedError("Refresh token expirado.");

  return { userId: refreshToken.userId, token: refreshToken };
}

// Revoca refresh token de la base de datos.
async function revokeRefreshToken(token) {
  const tokenHash = hashToken(token);
  const refreshToken = await authRepo.findRefreshTokenByHash(tokenHash);
  if (!refreshToken) {
    throw new NotFoundError("Refresh token inválido para revocación.");
  }

  await authRepo.updateRefreshToken(tokenHash, {
    revoked: true,
    revokedAt: new Date(),
  });

  return { success: true };
}

// Envía token de cambio de contraseña por email (simulado o real)
async function requestPasswordReset({ email }) {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    return {
      message:
        "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await authRepo.createPasswordReset({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const response = {
    message:
      "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
  };

  if (process.env.NODE_ENV !== "production") {
    response.token = token;
  }

  return response;
}

async function resetPassword({ email, token, newPassword }) {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new NotFoundError("No se encontró el usuario.");
  }

  const tokenHash = hashToken(token);
  const resetEntry = await authRepo.findPasswordReset({
    userId: user.id,
    tokenHash,
    usedAt: null,
    expiresAt: {
      gt: new Date(),
    },
  });

  if (!resetEntry) {
    throw new ValidationError("Token inválido o expirado.");
  }

  if (!isValidPassword(newPassword)) {
    throw new ValidationError(
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un carácter especial.",
    );
  }

  await userService.setPassword({ userId: user.id, newPassword });

  await authRepo.updatePasswordReset(resetEntry.id, { usedAt: new Date() });

  return { message: "Contraseña restablecida correctamente." };
}

function isValidPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{8,}$/;
  return regex.test(password);
}

export {
  registerUser,
  loginUser,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  requestPasswordReset,
  resetPassword,
  isValidPassword,
  findOrCreateOAuthUser,
};
