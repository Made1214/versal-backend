import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

vi.mock("../../features/auth/auth.service.js", () => ({
  registerUser: vi.fn(),
  saveRefreshToken: vi.fn(),
  loginUser: vi.fn(),
  verifyRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  findOrCreateOAuthUser: vi.fn(),
}));

import * as authController from "../../features/auth/auth.controller.js";
import * as authService from "../../features/auth/auth.service.js";

describe("Auth Controller", () => {
  let request;
  let reply;

  beforeEach(() => {
    vi.clearAllMocks();

    request = {
      body: {
        email: "test@example.com",
        password: "Password123!",
        username: "testuser",
        fullName: "Test User",
      },
      headers: {
        "user-agent": "test-agent",
      },
      jwtSign: vi.fn(
        (payload, options) => `${payload.userId}-${options.expiresIn}`,
      ),
      server: {
        jwt: {
          verify: vi.fn(),
        },
      },
    };

    reply = {
      setCookie: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
    };
  });

  it("register should persist refresh token on signup and return access token", async () => {
    authService.registerUser.mockResolvedValue({
      id: "user-123",
      role: "user",
      email: "test@example.com",
      username: "testuser",
      fullName: "Test User",
    });

    await authController.register(request, reply);

    expect(authService.saveRefreshToken).toHaveBeenCalledWith({
      token: "user-123-15d",
      userId: "user-123",
      userAgent: "test-agent",
      expiresAt: expect.any(Date),
    });
    expect(reply.setCookie).toHaveBeenCalledWith(
      "refreshToken",
      "user-123-15d",
      expect.any(Object),
    );
    expect(reply.code).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      user: {
        id: "user-123",
        role: "user",
        email: "test@example.com",
        username: "testuser",
        fullName: "Test User",
      },
      accessToken: "user-123-15m",
    });
  });

  it("forgotPassword should return generic message", async () => {
    authService.requestPasswordReset.mockResolvedValue({
      message:
        "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
    });

    await authController.forgotPassword(request, reply);

    expect(authService.requestPasswordReset).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      message:
        "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
    });
  });

  it("oauthGoogleCallback should fail when Google OAuth is not configured", async () => {
    request.server.googleOAuth2 = undefined;

    await expect(
      authController.oauthGoogleCallback(request, reply),
    ).rejects.toThrow(ValidationError);
  });

  it("logout should ignore missing refresh token record and clear cookie", async () => {
    request.cookies = { refreshToken: "missing-token" };
    authService.revokeRefreshToken.mockRejectedValue(
      new NotFoundError("Refresh token inválido para revocación."),
    );

    await authController.logout(request, reply);

    expect(reply.clearCookie).toHaveBeenCalledWith("refreshToken", {
      path: "/",
    });
    expect(reply.send).toHaveBeenCalledWith({
      message: "Sesión cerrada exitosamente",
    });
  });
});
