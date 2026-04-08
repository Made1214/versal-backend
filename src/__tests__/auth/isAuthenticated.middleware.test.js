import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundError, UnauthorizedError } from "../../utils/errors.js";

vi.mock("../../features/users/user.service.js", () => ({
  getUserById: vi.fn(),
}));

import isAuthenticated from "../../middlewares/isAuthenticated.js";
import { getUserById } from "../../features/users/user.service.js";

describe("isAuthenticated middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permite request con JWT válido y normaliza role", async () => {
    const request = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
      user: { userId: "user-1", role: "admin" },
    };

    getUserById.mockResolvedValue({
      id: "user-1",
      role: "ADMIN",
      isDeleted: false,
    });

    await expect(isAuthenticated(request, {})).resolves.toBeUndefined();
    expect(getUserById).toHaveBeenCalledWith({ userId: "user-1" });
    expect(request.user.role).toBe("ADMIN");
  });

  it("lanza UnauthorizedError cuando falta userId en payload", async () => {
    const request = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
      user: {},
    };

    await expect(isAuthenticated(request, {})).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("lanza UnauthorizedError cuando jwtVerify falla", async () => {
    const request = {
      jwtVerify: vi.fn().mockRejectedValue(new Error("invalid token")),
      user: { userId: "user-1" },
    };

    await expect(isAuthenticated(request, {})).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("lanza UnauthorizedError cuando el usuario ya no existe", async () => {
    const request = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
      user: { userId: "user-404", role: "USER" },
    };

    getUserById.mockRejectedValue(new NotFoundError("Usuario no encontrado"));

    await expect(isAuthenticated(request, {})).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("propaga errores internos no relacionados con auth", async () => {
    const request = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
      user: { userId: "user-1", role: "USER" },
    };

    getUserById.mockRejectedValue(new Error("DB down"));

    await expect(isAuthenticated(request, {})).rejects.toThrow("DB down");
  });
});
