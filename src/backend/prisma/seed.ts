/**
 * Datos iniciales: canchas C1–C4 (specs/data-model.md, sección 8).
 * Idempotente: se puede ejecutar varias veces sin duplicar datos.
 */
import { createPrismaClient } from "../src/db/client";
import type { Sport } from "../src/generated/prisma/client";

const courts: { id: string; name: string; sport: Sport; hourlyRate: string }[] = [
  { id: "C1", name: "Cancha 1 - Fútbol 7 Sintético", sport: "FUTBOL_7", hourlyRate: "60.00" },
  { id: "C2", name: "Cancha 2 - Pádel", sport: "PADEL", hourlyRate: "30.00" },
  { id: "C3", name: "Cancha 3 - Tenis", sport: "TENIS", hourlyRate: "25.00" },
  { id: "C4", name: "Cancha 4 - Básquetbol", sport: "BASQUETBOL", hourlyRate: "20.00" },
];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Falta DATABASE_URL (copia .env.example a .env)");

const prisma = createPrismaClient(databaseUrl);
try {
  for (const court of courts) {
    await prisma.court.upsert({
      where: { id: court.id },
      update: { name: court.name, sport: court.sport, hourlyRate: court.hourlyRate, isActive: true },
      create: { ...court, isActive: true },
    });
  }
  console.log(`Seed aplicado: ${courts.length} canchas (${courts.map((c) => c.id).join(", ")}).`);
} finally {
  await prisma.$disconnect();
}
