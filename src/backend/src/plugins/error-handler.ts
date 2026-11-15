import type { FastifyError, FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import type { ErrorResponse } from "@canchaya/shared";
import { isAppError } from "../shared/errors";

function body(code: string, message: string): ErrorResponse {
  return { error: { code, message } };
}

/**
 * Manejador único de errores (specs/architecture.md, sección 6).
 * Toda respuesta de error sale con el formato `{ error: { code, message } }`.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (isAppError(error)) {
      return reply.status(error.statusCode).send(body(error.code, error.message));
    }

    // Fase 1 del orden de validación: esquema y formato → 422.
    if (hasZodFastifySchemaValidationErrors(error) || error.validation) {
      const detail = error.validation
        ?.map((v) => {
          const field = v.instancePath.replace(/^\//, "").replaceAll("/", ".");
          return field ? `${field}: ${v.message ?? "valor inválido"}` : (v.message ?? "valor inválido");
        })
        .join("; ");
      return reply
        .status(422)
        .send(body("VALIDATION_ERROR", detail ? `Datos de entrada inválidos: ${detail}` : "Datos de entrada inválidos."));
    }

    // JSON mal formado u otros errores 4xx propios de Fastify.
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      const code = error.statusCode === 429 ? "RATE_LIMITED" : "VALIDATION_ERROR";
      const status = error.statusCode === 429 ? 429 : 422;
      return reply.status(status).send(body(code, error.message));
    }

    request.log.error({ err: error }, "Error no controlado");
    return reply.status(500).send(body("INTERNAL_ERROR", "Ocurrió un error interno. Intenta de nuevo más tarde."));
  });

  app.setNotFoundHandler((request, reply) => {
    return reply
      .status(404)
      .send(body("ROUTE_NOT_FOUND", `La ruta ${request.method} ${request.url} no existe.`));
  });
}
