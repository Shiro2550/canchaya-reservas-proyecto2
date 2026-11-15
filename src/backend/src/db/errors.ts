/**
 * Lectura de errores de Prisma 7 con el adaptador `mariadb`.
 * En una violación de índice único (P2002) el nombre del índice viene en
 * `meta.driverAdapterError.cause.constraint.index`.
 */
interface PrismaLikeError {
  code?: string;
  meta?: { driverAdapterError?: { cause?: { constraint?: { index?: string } } } };
}

export function violatedUniqueIndex(error: unknown): string | undefined {
  const e = error as PrismaLikeError | null;
  if (!e || e.code !== "P2002") return undefined;
  return e.meta?.driverAdapterError?.cause?.constraint?.index;
}
