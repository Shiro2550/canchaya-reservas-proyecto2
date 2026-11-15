/**
 * Antes de toda la suite: aplica las migraciones de Prisma sobre la base de pruebas.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

export default function setup(): void {
  if (existsSync(".env")) process.loadEnvFile(".env");
  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) throw new Error("Falta TEST_DATABASE_URL en .env (ver .env.example)");

  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: "src/backend",
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: "pipe",
  });
}
