import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../features/auth/auth.service.js", () => ({
  registerUser: vi.fn(),
  saveRefreshToken: vi.fn(),
  loginUser: vi.fn(),
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
      token: "user-123-30d",
      userId: "user-123",
      userAgent: "test-agent",
      expiresAt: expect.any(Date),
    });
    expect(reply.setCookie).toHaveBeenCalledWith(
      "refreshToken",
      "user-123-30d",
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
});
