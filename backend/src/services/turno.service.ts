import type { Turno } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { TurnoConDetalle } from "../types/turno.types";
import type { TurnoCreate, TurnoUpdate } from "../validations/turno.validation";

export async function findAll(): Promise<TurnoConDetalle[]> {
  return prisma.turno.findMany({
    include: { cliente: true, servicio: true },
  });
}

export async function findById(id: number): Promise<TurnoConDetalle | null> {
  return prisma.turno.findUnique({
    where: { id },
    include: { cliente: true, servicio: true },
  });
}

export async function create(datos: TurnoCreate): Promise<TurnoConDetalle> {
  return prisma.turno.create({
    data: datos,
    include: { cliente: true, servicio: true },
  });
}

// 1 sola query: Prisma lanza P2025 si el registro no existe
export async function update(id: number, datos: TurnoUpdate): Promise<Turno | null> {
  try {
    return await prisma.turno.update({
      where: { id },
      data: datos,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

// 1 sola query: Prisma lanza P2025 si el registro no existe
export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.turno.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return false;
    throw e;
  }
}
