import * as authService from "./auth.service.js";
import * as userService from "../users/user.service.js";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

async function register(request, reply) {
  const { email, password, username, fullName } = request.body;

  const user = await authService.registerUser({
    email,
    password,
    username,
    fullName,
  });

  const payload = { userId: user.id, role: user.role };

  const accessToken = request.jwtSign(payload, { expiresIn: "15m" });
  const refreshToken = request.jwtSign(payload, { expiresIn: "30d" });

  reply
    .setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    })
    .code(201)
    .send({ user, accessToken });
}

async function login(request, reply) {
  const { email, password } = request.body;

  const user = await authService.loginUser({ email, password });

  const payload = { userId: user.id, role: user.role };

  const accessToken = request.jwtSign(payload, { expiresIn: "15m" });
  const refreshToken = request.jwtSign(payload, { expiresIn: "30d" });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await authService.saveRefreshToken({
    token: refreshToken,
    userId: user.id,
    userAgent: request.headers["user-agent"] || "unknown",
    expiresAt,
  });

  reply
    .setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    })
    .send({ user, accessToken });
}

async function oauthGoogleCallback(request, reply) {
  const tokenObject =
    await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
      request,
    );
  const access_token = tokenObject.token.access_token;

  const userInfoResp = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  );
  const profile = await userInfoResp.json();

  if (!profile.email) {
    throw new Error("No se obtuvo email de Google");
  }

  const user = await authService.findOrCreateOAuthUser({
    email: profile.email,
    fullName: profile.name,
    profileImage: profile.picture,
    provider: "google",
    oauthId: profile.sub,
  });

  const payload = { userId: user.id, role: user.role };

  const accessToken = request.jwtSign(payload, { expiresIn: "15m" });
  const refreshToken = request.jwtSign(payload, { expiresIn: "30d" });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await authService.saveRefreshToken({
    token: refreshToken,
    userId: user.id,
    userAgent: request.headers["user-agent"] || "unknown",
    expiresAt,
  });

  reply
    .setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    })
    .send({ user, accessToken });
}

async function refreshToken(request, reply) {
  const token = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (!token) {
    throw new Error("No refresh token provided.");
  }

  await authService.verifyRefreshToken(token);

  const decoded = await request.jwtVerify({ token });
  const payload = { userId: decoded.userId, role: decoded.role };
  const accessToken = request.jwtSign(payload, { expiresIn: "15m" });

  return reply.send({ accessToken });
}

async function logout(request, reply) {
  const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (refreshToken) {
    await authService.revokeRefreshToken(refreshToken);
  }

  reply
    .clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: "/" })
    .send({ message: "Logged out" });
}

async function me(request, reply) {
  const userId = request.user && request.user.userId;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await userService.getUserById({ userId });
  return reply.send({ user });
}

async function forgotPassword(request, reply) {
  const { email } = request.body;

  const result = await authService.requestPasswordReset({ email });

  // TODO
  // en producción no devolver token en respuesta
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
