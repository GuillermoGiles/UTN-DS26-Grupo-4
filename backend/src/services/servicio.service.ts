import type { Servicio } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function findAll(tipo?: string): Promise<Servicio[]> {
  if (tipo === undefined) {
    return prisma.servicio.findMany();
  }
  return prisma.servicio.findMany({ where: { tipo } });
}

export async function findById(id: number): Promise<Servicio | null> {
  return prisma.servicio.findUnique({ where: { id } });
}

export async function create(datos: Omit<Servicio, "id">): Promise<Servicio> {
  return prisma.servicio.create({ data: datos });
}

export async function update(id: number, datos: Partial<Omit<Servicio, "id">>): Promise<Servicio | null> {
  const existe = await prisma.servicio.findUnique({ where: { id } });
  if (!existe) return null;

  return prisma.servicio.update({
    where: { id },
    data: datos,
  });
}

export async function remove(id: number): Promise<boolean> {
  const existe = await prisma.servicio.findUnique({ where: { id } });
  if (!existe) return false;

  await prisma.servicio.delete({ where: { id } });
  return true;
}
