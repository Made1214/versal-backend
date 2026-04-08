import fp from "fastify-plugin";
import prisma from "../config/prisma.js";

export default fp(async function databasePlugin(fastify) {
  fastify.decorate("db", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
