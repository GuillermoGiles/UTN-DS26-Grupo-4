import type { Turno } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function findAll(): Promise<Turno[]> {
  return prisma.turno.findMany();
}

export async function findById(id: number): Promise<Turno | null> {
  return prisma.turno.findUnique({ where: { id } });
}

export async function create(datos: Omit<Turno, "id">): Promise<Turno> {
  return prisma.turno.create({ data: datos });
}

// 1 sola query: Prisma lanza P2025 si el registro no existe
export async function update(id: number, datos: Partial<Omit<Turno, "id">>): Promise<Turno | null> {
  try {
    return await prisma.turno.update({ where: { id }, data: datos });
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
