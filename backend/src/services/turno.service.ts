import type { Turno } from "@prisma/client";
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

export async function update(id: number, datos: TurnoUpdate): Promise<Turno> {
  return prisma.turno.update({
    where: { id },
    data: datos,
  });
}

export async function remove(id: number): Promise<Turno> {
  return prisma.turno.delete({
    where: { id },
  });
}
