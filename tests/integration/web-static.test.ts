/**
 * Modo producción / Docker (issue #34): la API sirve la web compilada y devuelve index.html
 * en las rutas de la SPA, sin afectar a /api ni a /docs.
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/backend/src/app";
import type { PrismaClient } from "../../src/backend/src/db/client";
import { createTestPrisma, resetDatabase } from "../helpers/db";

let prisma: PrismaClient;
let app: FastifyInstance;
let webDir: string;

beforeAll(async () => {
  webDir = mkdtempSync(join(tmpdir(), "canchaya-web-"));
  mkdirSync(join(webDir, "assets"));
  writeFileSync(join(webDir, "index.html"), "<!doctype html><title>CanchaYa</title><div id=root></div>");
  writeFileSync(join(webDir, "assets", "app.js"), "console.log('ok')");
  prisma = createTestPrisma();
  await resetDatabase(prisma);
  app = await buildApp({ prisma, webDir, docs: true });
});

afterAll(async () => {
  await app?.close();
  await prisma?.$disconnect();
  rmSync(webDir, { recursive: true, force: true });
});

describe("Web compilada servida por la API", () => {
  it("entrega index.html en la raíz", async () => {
    const res = await app.inject({ method: "GET", url: "/" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.body).toContain("<title>CanchaYa</title>");
  });

  it("entrega los archivos estáticos", async () => {
    const res = await app.inject({ method: "GET", url: "/assets/app.js" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("console.log");
  });

  it.each(["/canchas/C1", "/reserva/CY-7K3M9QXA", "/mi-reserva"])("responde index.html en la ruta de la SPA %s", async (url) => {
    const res = await app.inject({ method: "GET", url });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("<title>CanchaYa</title>");
  });

  it("la API sigue respondiendo JSON, y una ruta /api inexistente sigue siendo 404 JSON", async () => {
    const courts = await app.inject({ method: "GET", url: "/api/v1/courts" });
    expect(courts.statusCode).toBe(200);
    expect(courts.json()).toHaveLength(2);

    const missing = await app.inject({ method: "GET", url: "/api/v1/no-existe" });
    expect(missing.statusCode).toBe(404);
    expect(missing.json().error.code).toBe("ROUTE_NOT_FOUND");
  });

  it("la documentación OpenAPI convive con la web", async () => {
    const res = await app.inject({ method: "GET", url: "/docs/json" });
    expect(res.statusCode).toBe(200);
    expect(res.json().paths).toHaveProperty("/api/v1/bookings");
  });
});
