import { Prisma } from "@prisma/client";

/**
 * ¿El error es porque el registro está relacionado con otros (una FK lo impide)?
 *
 * Prisma lo informa como P2003 cuando Postgres devuelve 23503 (foreign_key_violation).
 * Pero las versiones nuevas de Postgres (Neon, en producción) devuelven 23001
 * (restrict_violation) para un `onDelete: Restrict`, y Prisma no lo traduce a P2003:
 * llega como "Database error. Code: `23001`". Sin este chequeo terminaba en un 500.
 */
export function esErrorDeRelacion(e: unknown): boolean {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (e.code === "P2003") return true;
  return /\b(23001|23503)\b/.test(e.message);
}
