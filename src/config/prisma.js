import { PrismaClient } from "@prisma/client";

const shouldLogQueries =
  process.env.NODE_ENV !== "production" &&
  String(process.env.PRISMA_LOG_QUERIES).toLowerCase() === "true";

const logConfig = [
  { level: "info", emit: "event" },
  { level: "warn", emit: "event" },
  { level: "error", emit: "event" },
];

if (shouldLogQueries) {
  logConfig.push({ level: "query", emit: "stdout" });
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: logConfig,
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
