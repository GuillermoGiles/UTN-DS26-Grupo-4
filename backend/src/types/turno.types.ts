import { Prisma } from "@prisma/client";

export type { Turno } from "@prisma/client";

export type TurnoConDetalle = Prisma.TurnoGetPayload<{
  include: { cliente: true; servicio: true };
}>;

