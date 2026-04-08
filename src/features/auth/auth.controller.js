import * as authService from "./auth.service.js";
import * as userService from "../users/user.service.js";
import config from "../../config/index.js";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/errors.js";
import { normalizeRole } from "../../utils/roles.js";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
const ACCESS_TOKEN_EXPIRY = config.JWT_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRY = config.REFRESH_TOKEN_EXPIRES_IN;

function parseDurationToSeconds(duration, fallbackInSeconds) {
  const match = /^(\d+)([smhd])$/.exec(String(duration || "").trim());
  if (!match) return fallbackInSeconds;

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  return value * multipliers[unit];
}

const REFRESH_TOKEN_MAX_AGE = parseDurationToSeconds(
  REFRESH_TOKEN_EXPIRY,
  15 * 24 * 60 * 60,
);

function setRefreshCookie(reply, refreshToken) {
  return reply.setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

async function createAuthSession({ request, reply, user }) {
  const role = normalizeRole(user.role);
  if (!role) {
    throw new UnauthorizedError("Usuario con rol inválido.");
  }

  const payload = { userId: user.id, role };
  const accessToken = request.jwtSign(payload, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = request.jwtSign(payload, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000);
  await authService.saveRefreshToken({
    token: refreshToken,
    userId: user.id,
    userAgent: request.headers["user-agent"] || "unknown",
    expiresAt,
  });

  setRefreshCookie(reply, refreshToken);
  return accessToken;
}

async function register(request, reply) {
  const { email, password, username, fullName } = request.body;

  const user = await authService.registerUser({
    email,
    password,
    username,
    fullName,
  });

  const accessToken = await createAuthSession({ request, reply, user });

  return reply.code(201).send({ user, accessToken });
}

async function login(request, reply) {
  const { email, password } = request.body;

  const user = await authService.loginUser({ email, password });
  const accessToken = await createAuthSession({ request, reply, user });

  return reply.send({ user, accessToken });
}

async function oauthGoogleCallback(request, reply) {
  if (!request.server.googleOAuth2) {
    throw new ValidationError(
      "Google OAuth no está configurado en el servidor.",
    );
  }

  const tokenObject =
    await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
      request,
    );
  const access_token = tokenObject.token.access_token;

  if (!access_token) {
    throw new ValidationError(
      "No se pudo obtener el token de acceso de Google.",
    );
  }

  let profile;
  try {
    const userInfoResp = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    if (!userInfoResp.ok) {
      throw new ValidationError("No se pudo obtener el perfil de Google.");
    }

    profile = await userInfoResp.json();
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError(
      "Error al consultar la información del usuario en Google.",
    );
  }

  if (!profile.email) {
    throw new ValidationError("No se obtuvo email de Google");
  }

  const user = await authService.findOrCreateOAuthUser({
    email: profile.email,
    fullName: profile.name,
    profileImage: profile.picture,
    provider: "google",
    oauthId: profile.sub,
  });

  const accessToken = await createAuthSession({ request, reply, user });
  return reply.send({ user, accessToken });
}

async function refreshToken(request, reply) {
  const token = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (!token) {
    throw new UnauthorizedError("No refresh token provided.");
  }

  await authService.verifyRefreshToken(token);

  let decoded;
  try {
    decoded = request.server.jwt.verify(token);
  } catch {
    throw new UnauthorizedError("Refresh token inválido o expirado.");
  }

  if (!decoded?.userId || !decoded?.role) {
    throw new UnauthorizedError("Refresh token inválido.");
  }

  const role = normalizeRole(decoded.role);
  if (!role) {
    throw new UnauthorizedError("Refresh token inválido.");
  }

  await userService.getUserById({ userId: decoded.userId });

  const payload = { userId: decoded.userId, role };
  const accessToken = request.jwtSign(payload, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  return reply.send({ accessToken });
}

async function logout(request, reply) {
  const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (refreshToken) {
    try {
      await authService.revokeRefreshToken(refreshToken);
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }
  }

  reply
    .clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: "/" })
    .send({ message: "Sesión cerrada exitosamente" });
}

async function me(request, reply) {
  const userId = request.user && request.user.userId;
  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const user = await userService.getUserById({ userId });
  return reply.send({ user });
}

async function forgotPassword(request, reply) {
  const { email } = request.body;

  const result = await authService.requestPasswordReset({ email });
  return reply.code(200).send({ message: result.message });
}

async function resetPassword(request, reply) {
  const { email, token, newPassword } = request.body;

  const result = await authService.resetPassword({ email, token, newPassword });

  return reply.code(200).send({ message: result.message });
}

export {
  register,
  login,
  refreshToken,
  logout,
  me,
  forgotPassword,
  resetPassword,
  oauthGoogleCallback,
};
