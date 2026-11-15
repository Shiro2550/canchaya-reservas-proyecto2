import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

/**
 * Crea el cliente de Prisma sobre MySQL 8.4 usando el adaptador `mariadb` (Prisma 7).
 *
 * La sesión se fija en UTC (`time_zone = '+00:00'`) y el conector también (`timezone: 'Z'`),
 * de modo que `CURRENT_TIMESTAMP(3)` y las fechas de auditoría siempre se guardan en UTC
 * (specs/data-model.md, sección 2), sin importar la zona horaria del servidor.
 */
export function createPrismaClient(databaseUrl: string): PrismaClient {
  const url = new URL(databaseUrl);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    timezone: "Z",
    sessionVariables: { time_zone: "+00:00" },
    connectionLimit: 10,
  });
  return new PrismaClient({ adapter });
}

export type { PrismaClient };
