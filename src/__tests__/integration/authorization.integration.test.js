import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import Fastify from "fastify";
import jwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";

vi.mock("../../features/users/user.service.js", () => ({
  getUserById: vi.fn(),
  getAllUsers: vi.fn(),
}));

vi.mock("../../features/stories/story.service.js", () => ({
  getStoryById: vi.fn(),
  deleteStory: vi.fn(),
}));

import authPlugin from "../../plugins/auth.plugin.js";
import errorHandler from "../../middlewares/errorHandler.js";
import userRoutes from "../../features/users/user.routes.js";
import reportRoutes from "../../features/reports/report.routes.js";
import storyRoutes from "../../features/stories/story.routes.js";
import * as userService from "../../features/users/user.service.js";
import * as storyService from "../../features/stories/story.service.js";

describe("Authorization Integration", () => {
  let app;
  let readerToken;
  let adminToken;

  beforeAll(async () => {
    app = Fastify({ logger: false });

    await app.register(errorHandler);
    await app.register(jwt, {
      secret: "test-secret-key-for-authz-tests",
      sign: { expiresIn: "1h" },
    });
    await app.register(fastifyCookie);
    await app.register(authPlugin);

    await app.register(userRoutes, { prefix: "/api/users" });
    await app.register(reportRoutes, { prefix: "/api" });
    await app.register(storyRoutes, { prefix: "/api/stories" });

    await app.ready();

    readerToken = app.jwt.sign({ userId: "reader-user", role: "USER" });
    adminToken = app.jwt.sign({ userId: "admin-user", role: "ADMIN" });
  });

  beforeEach(() => {
    vi.clearAllMocks();

    userService.getUserById.mockImplementation(async ({ userId }) => {
      if (userId === "admin-user") {
        return { id: "admin-user", role: "ADMIN", isDeleted: false };
      }
      if (userId === "reader-user") {
        return { id: "reader-user", role: "USER", isDeleted: false };
      }
      return { id: userId, role: "USER", isDeleted: false };
    });

    userService.getAllUsers.mockResolvedValue([]);
    storyService.getStoryById.mockResolvedValue({
      id: "story-1",
      authorId: "owner-user",
      coverImagePublicId: null,
    });
    storyService.deleteStory.mockResolvedValue({ message: "ok" });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("deniega /api/users/all para usuario no admin", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/users/all",
      headers: {
        authorization: `Bearer ${readerToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("permite /api/users/all para admin", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/users/all",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
  });

  it("deniega /api/admin/reports para usuario no admin", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/admin/reports",
      headers: {
        authorization: `Bearer ${readerToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("deniega delete de story cuando no es owner ni admin", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/stories/story-1",
      headers: {
        authorization: `Bearer ${readerToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("permite delete de story para admin", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/stories/story-1",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
  });
});
