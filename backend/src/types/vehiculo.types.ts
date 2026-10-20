import { Prisma } from "@prisma/client";
import type { ProximoService } from "../utils/service";

export type { Vehiculo } from "@prisma/client";

export const vehiculoListadoInclude = {
  cliente: { select: { id: true, nombre: true, telefono: true } },
} satisfies Prisma.VehiculoInclude;

export const vehiculoDetalleInclude = {
  cliente: { select: { id: true, nombre: true, telefono: true } },
  turnos: { include: { servicio: true }, orderBy: [{ fecha: "desc" }, { hora: "desc" }] },
  lavados: {
    include: { servicio: true, empleado: { select: { id: true, nombre: true } } },
    orderBy: { fecha: "desc" },
  },
} satisfies Prisma.VehiculoInclude;

export type VehiculoListado = Prisma.VehiculoGetPayload<{ include: typeof vehiculoListadoInclude }>;
export type VehiculoDetalle = Prisma.VehiculoGetPayload<{ include: typeof vehiculoDetalleInclude }>;

/** Lo que devuelve la API: el vehículo con el cálculo del próximo service. */
export type ConService<T> = T & { service: ProximoService };
