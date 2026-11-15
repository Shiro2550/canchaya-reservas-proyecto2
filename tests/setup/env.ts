/**
 * Carga .env y apunta DATABASE_URL a la base de pruebas, para que ninguna prueba
 * toque la base de desarrollo por accidente.
 */
import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile(".env");

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) throw new Error("Falta TEST_DATABASE_URL en .env (ver .env.example)");
if (testUrl === process.env.DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL no puede ser igual a DATABASE_URL: las pruebas borran datos.");
}
process.env.DATABASE_URL = testUrl;
process.env.NODE_ENV = "test";
