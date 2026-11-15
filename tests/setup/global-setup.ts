/**
 * Antes de toda la suite: aplica las migraciones de Prisma sobre la base de pruebas.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

export default function setup(): void {
  if (existsSync(".env")) process.loadEnvFile(".env");
  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) throw new Error("Falta TEST_DATABASE_URL en .env (ver .env.example)");

  try {
    execFileSync("npx", ["prisma", "migrate", "deploy"], {
      cwd: "src/backend",
      env: { ...process.env, DATABASE_URL: testUrl },
      stdio: "pipe",
      // En Windows, npx es un script .cmd y solo se puede ejecutar a través de la shell.
      shell: process.platform === "win32",
    });
  } catch (error) {
    const output = (error as { stderr?: Buffer }).stderr?.toString() || String(error);
    throw new Error(
      "No se pudieron aplicar las migraciones a la base de pruebas (TEST_DATABASE_URL).\n" +
        "¿Está MySQL encendido y existe la base canchaya_test? Ver README, sección «Cómo ejecutar».\n\n" +
        output,
    );
  }
}
