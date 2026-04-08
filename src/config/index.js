import fs from "fs";
import dotenv from "dotenv";
import envSchema from "env-schema";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

/**
 * Configuración centralizada con validación de variables de entorno
 * Se ejecuta al arrancar la aplicación para validar que todas las variables necesarias existan
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..", "..");

function resolveEnvFilename(nodeEnv) {
  const normalized = nodeEnv?.toLowerCase?.() || "development";
  const candidates = [
    `.env.${normalized}`,
    `.env.${normalized.slice(0, 3)}`,
    ".env",
  ];

  for (const candidate of candidates) {
    const candidatePath = join(rootDir, candidate);
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return join(rootDir, ".env");
}

const envFilePath = resolveEnvFilename(process.env.NODE_ENV);
const result = dotenv.config({ path: envFilePath });

if (result.error && result.error.code !== "ENOENT") {
  throw result.error;
}

const schema = {
  type: "object",
  required: [
    // Variables obligatorias que deben estar presentes en el .env
    "JWT_SECRET",
    "DATABASE_URL",
    "CORS_ORIGINS",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_OAUTH_CALLBACK_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ],
  properties: {
    // Servidor
    PORT: {
      type: "string",
      default: "3000",
    },
    NODE_ENV: {
      type: "string",
      enum: ["development", "production", "test"],
      default: "development",
    },

    // JWT
    JWT_SECRET: {
      type: "string",
      minLength: 32,
    },
    JWT_EXPIRES_IN: {
      type: "string",
      default: "15m",
    },
    REFRESH_TOKEN_EXPIRES_IN: {
      type: "string",
      default: "15d",
    },

    // Base de datos
    DATABASE_URL: {
      type: "string",
    },
    PRISMA_LOG_QUERIES: {
      type: "boolean",
      default: false,
    },

    CORS_ORIGINS: {
      type: "string",
      default: "http://localhost:8080,http://localhost:3000",
    },

    // OAuth Google
    GOOGLE_CLIENT_ID: {
      type: "string",
      default: "placeholder",
    },
    GOOGLE_CLIENT_SECRET: {
      type: "string",
      default: "placeholder",
    },
    GOOGLE_OAUTH_CALLBACK_URL: {
      type: "string",
      default: "http://localhost:3000/api/auth/oauth/google/callback",
    },

    // Stripe (opcional)
    STRIPE_SECRET_KEY: {
      type: "string",
    },
    STRIPE_WEBHOOK_SECRET: {
      type: "string",
    },
    STRIPE_CURRENCY: {
      type: "string",
      default: "usd",
    },
    FRONTEND_URL: {
      type: "string",
      default: "http://localhost:8080",
    },

    // Seguridad
    RATE_LIMIT_MAX: {
      type: "string",
      default: "100",
    },
    RATE_LIMIT_WINDOW: {
      type: "string",
      default: "1 minute",
    },

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: {
      type: "string",
    },
    CLOUDINARY_API_KEY: {
      type: "string",
    },
    CLOUDINARY_API_SECRET: {
      type: "string",
    },
  },
};

// Validar y exportar configuración
const config = envSchema({
  schema,
  dotenv: false,
});

// Procesar arrays desde strings
config.CORS_ORIGINS_ARRAY = config.CORS_ORIGINS.split(",").map((origin) =>
  origin.trim(),
);
config.RATE_LIMIT_MAX_NUMBER = parseInt(config.RATE_LIMIT_MAX, 10);

// Configuraciones derivadas
config.IS_PRODUCTION = config.NODE_ENV === "production";
config.IS_DEVELOPMENT = config.NODE_ENV === "development";

// Validar que Stripe esté completamente configurado o no configurado
if (
  (config.STRIPE_SECRET_KEY && !config.STRIPE_WEBHOOK_SECRET) ||
  (!config.STRIPE_SECRET_KEY && config.STRIPE_WEBHOOK_SECRET)
) {
  throw new Error(
    "STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET deben estar ambas configuradas o ambas ausentes",
  );
}

// Validar que Cloudinary esté completamente configurado o no configurado
if (
  (config.CLOUDINARY_CLOUD_NAME &&
    (!config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET)) ||
  (!config.CLOUDINARY_CLOUD_NAME &&
    (config.CLOUDINARY_API_KEY || config.CLOUDINARY_API_SECRET))
) {
  throw new Error(
    "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET deben estar todas configuradas o todas ausentes",
  );
}

export default config;
