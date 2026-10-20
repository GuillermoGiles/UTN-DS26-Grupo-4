import { Prisma } from "@prisma/client";

export type { Cliente } from "@prisma/client";

export const clienteListadoInclude = {
  vehiculos: { select: { id: true, patente: true, marca: true, modelo: true } },
  _count: { select: { turnos: true } },
} satisfies Prisma.ClienteInclude;

export const clienteDetalleInclude = {
  vehiculos: { orderBy: { id: "asc" } },
  turnos: {
    include: { servicio: true, vehiculo: true },
    orderBy: [{ fecha: "desc" }, { hora: "desc" }],
  },
} satisfies Prisma.ClienteInclude;

export type ClienteListado = Prisma.ClienteGetPayload<{ include: typeof clienteListadoInclude }>;
export type ClienteDetalle = Prisma.ClienteGetPayload<{ include: typeof clienteDetalleInclude }>;
