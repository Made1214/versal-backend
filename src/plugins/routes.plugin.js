import fp from "fastify-plugin";
import authRoutes from "../features/auth/auth.routes.js";
import storyRoutes from "../features/stories/story.routes.js";
import chapterRoutes from "../features/chapters/chapter.routes.js";
import userRoutes from "../features/users/user.routes.js";
import favoriteRoutes from "../features/favorites/favorite.routes.js";
import interactionRoutes from "../features/interactions/interaction.routes.js";
import reportRoutes from "../features/reports/report.routes.js";
import transactionRoutes from "../features/transactions/transaction.routes.js";
import donationRoutes from "../features/donations/donation.routes.js";

export default fp(async function routesPlugin(fastify) {
  // Health check endpoint
  fastify.get("/health", async (_request, reply) => {
    try {
      await fastify.db.$queryRaw`SELECT 1`;

      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "connected",
      };
    } catch (error) {
      fastify.log.error({ err: error }, "Health check DB probe failed");
      reply.code(503);
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        message: "Service unavailable",
      };
    }
  });
  fastify.register(authRoutes, { prefix: "/api" });
  fastify.register(storyRoutes, { prefix: "/api/stories" });
  fastify.register(chapterRoutes, { prefix: "/api" });
  fastify.register(userRoutes, { prefix: "/api/users" });
  fastify.register(favoriteRoutes, { prefix: "/api/favorites" });
  fastify.register(interactionRoutes, { prefix: "/api" });
  fastify.register(reportRoutes, { prefix: "/api/reports" });
  fastify.register(transactionRoutes, { prefix: "/api" });
  fastify.register(donationRoutes, { prefix: "/api/donations" });
});
