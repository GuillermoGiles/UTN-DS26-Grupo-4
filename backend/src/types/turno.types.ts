import { Prisma } from "@prisma/client";

export type { Turno } from "@prisma/client";

export const turnoInclude = {
  cliente: true,
  servicio: true,
  vehiculo: true,
} satisfies Prisma.TurnoInclude;

export type TurnoConDetalle = Prisma.TurnoGetPayload<{ include: typeof turnoInclude }>;
