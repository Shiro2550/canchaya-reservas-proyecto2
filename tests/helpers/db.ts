import { createPrismaClient, type PrismaClient } from "../../src/backend/src/db/client";

export const TEST_COURTS = [
  { id: "C1", name: "Cancha 1 - Fútbol 7 Sintético", sport: "FUTBOL_7", hourlyRate: "60.00" },
  { id: "C2", name: "Cancha 2 - Pádel", sport: "PADEL", hourlyRate: "30.00" },
] as const;

export function createTestPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url?.includes("_test")) throw new Error(`Se esperaba una base de pruebas, se recibió: ${url}`);
  return createPrismaClient(url);
}

/** Deja la base de pruebas vacía y con las canchas mínimas de los escenarios Gherkin. */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.bookingEvent.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.court.deleteMany();
  await prisma.court.createMany({ data: TEST_COURTS.map((c) => ({ ...c })) });
}
