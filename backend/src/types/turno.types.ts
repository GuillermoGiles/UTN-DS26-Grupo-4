import { Prisma } from "@prisma/client";

export type { Turno } from "@prisma/client";

export const turnoInclude = {
  cliente: true,
  // N:M explícita: cada renglón trae su servicio
  servicios: { include: { servicio: true }, orderBy: { servicioId: "asc" } },
  vehiculo: true,
} satisfies Prisma.TurnoInclude;

export type TurnoConDetalle = Prisma.TurnoGetPayload<{ include: typeof turnoInclude }>;
