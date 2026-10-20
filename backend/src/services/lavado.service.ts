import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";
import { rangoDelDia } from "../utils/fechas";
import type { LavadoCreate, LavadoUpdate } from "../validations/lavado.validation";

export const lavadoInclude = {
  vehiculo: { include: { cliente: { select: { id: true, nombre: true } } } },
  servicio: true,
  empleado: { select: { id: true, nombre: true } },
} satisfies Prisma.LavadoInclude;

export type LavadoConDetalle = Prisma.LavadoGetPayload<{ include: typeof lavadoInclude }>;

export async function findAll(fecha?: string): Promise<LavadoConDetalle[]> {
  const where: Prisma.LavadoWhereInput = {};
  if (fecha) {
    const { desde, hasta } = rangoDelDia(fecha);
    where.fecha = { gte: desde, lt: hasta };
  }
  return prisma.lavado.findMany({ where, include: lavadoInclude, orderBy: { fecha: "desc" } });
}

export async function findById(id: number): Promise<LavadoConDetalle | null> {
  return prisma.lavado.findUnique({ where: { id }, include: lavadoInclude });
}

/**
 * Estas preguntas necesitan la base, por eso van en el service y no en Zod
 * (C17, extensión 4): ¿existe el vehículo? ¿el servicio es de lavadero?
 */
async function servicioDeLavadero(servicioId: number) {
  const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
  if (!servicio) throw new AppError(400, "El servicio no existe");
  if (servicio.tipo !== "lavadero") throw new AppError(400, "El servicio elegido no es de lavadero");
  return servicio;
}

async function verificarVehiculo(vehiculoId: number) {
  const vehiculo = await prisma.vehiculo.findUnique({ where: { id: vehiculoId } });
  if (!vehiculo) throw new AppError(400, "El vehículo no existe");
}

// El empleado es quien está logueado; el precio se copia del servicio en este momento
export async function create(datos: LavadoCreate, empleadoId: number): Promise<LavadoConDetalle> {
  const servicio = await servicioDeLavadero(datos.servicioId);
  await verificarVehiculo(datos.vehiculoId);
  return prisma.lavado.create({
    data: { ...datos, precio: servicio.precio, empleadoId },
    include: lavadoInclude,
  });
}

export async function update(id: number, datos: LavadoUpdate): Promise<LavadoConDetalle | null> {
  const data: Prisma.LavadoUncheckedUpdateInput = { ...datos };
  if (datos.servicioId) data.precio = (await servicioDeLavadero(datos.servicioId)).precio;
  if (datos.vehiculoId) await verificarVehiculo(datos.vehiculoId);
  try {
    return await prisma.lavado.update({ where: { id }, data, include: lavadoInclude });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.lavado.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return false;
    throw e;
  }
}
