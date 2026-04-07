import fp from "fastify-plugin";
import authRoutes from "./src/features/auth/auth.routes.js";
import storyRoutes from "./src/features/stories/story.routes.js";
import chapterRoutes from "./src/features/chapters/chapter.routes.js";
import userRoutes from "./src/features/users/user.routes.js";
import favoriteRoutes from "./src/features/favorites/favorite.routes.js";
import interactionRoutes from "./src/features/interactions/interaction.routes.js";
import reportRoutes from "./src/features/reports/report.routes.js";
import transactionRoutes from "./src/features/transactions/transaction.routes.js";
import donationRoutes from "./src/features/donations/donation.routes.js";

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
      reply.code(503);
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error.message,
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
