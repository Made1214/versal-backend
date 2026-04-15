import fp from "fastify-plugin";
import { AppError } from "../utils/errors.js";

/**
 * Error handler global para Fastify
 * Maneja errores operacionales y no operacionales
 */
async function errorHandler(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    // Log del error
    fastify.log.error(
      {
        err: error,
        request: {
          method: request.method,
          url: request.url,
          params: request.params,
          query: request.query,
        },
      },
      error.message,
    );

    // Si es un error operacional conocido (AppError)
    if (error instanceof AppError && error.isOperational) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
        statusCode: error.statusCode,
      });
    }

    // Errores de validación de Fastify
    if (error.validation) {
      return reply.code(400).send({
        error: "ValidationError",
        message: "Datos de entrada inválidos",
        details: error.validation,
        statusCode: 400,
      });
    }

    // Errores de JWT
    if (error.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER") {
      return reply.code(401).send({
        error: "UnauthorizedError",
        message: "Token de autenticación no proporcionado",
        statusCode: 401,
      });
    }

    if (error.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED") {
      return reply.code(401).send({
        error: "UnauthorizedError",
        message: "Token de autenticación expirado",
        statusCode: 401,
      });
    }

    if (error.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID") {
      return reply.code(401).send({
        error: "UnauthorizedError",
        message: "Token de autenticación inválido",
        statusCode: 401,
      });
    }

    // Error genérico no manejado
    const statusCode = error.statusCode || 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Error interno del servidor"
        : error.message;

    return reply.code(statusCode).send({
      error: "InternalServerError",
      message,
      statusCode,
      ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
    });
  });
}

export default fp(errorHandler);
