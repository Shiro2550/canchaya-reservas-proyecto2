import { z } from "zod";
import { COMPLEX_TIMEZONE } from "@canchaya/shared";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().startsWith("mysql://", "DATABASE_URL debe ser una URL mysql://"),
  API_PORT: z.coerce.number().int().positive().default(3000),
  API_HOST: z.string().default("127.0.0.1"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  TZ_COMPLEX: z.string().default(COMPLEX_TIMEZONE),
  /** Carpeta de la web compilada; si existe, la API también sirve la SPA (Docker / producción). */
  WEB_DIST_DIR: z.string().optional(),
  /** Publica la documentación OpenAPI en /docs. */
  API_DOCS: z.enum(["true", "false"]).default("true").transform((v) => v === "true"),
});

export type Env = z.infer<typeof envSchema>;

/** Valida las variables de entorno al arrancar; falla rápido con un mensaje claro. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Variables de entorno inválidas:\n${issues}`);
  }
  return parsed.data;
}
