import type { Servicio } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";

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

// 1 sola query: Prisma lanza P2025 si el registro no existe
export async function update(id: number, datos: Partial<Omit<Servicio, "id">>): Promise<Servicio | null> {
  try {
    return await prisma.servicio.update({ where: { id }, data: datos });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

// 1 sola query: Prisma lanza P2025 si el registro no existe
export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.servicio.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") return false;
      if (e.code === "P2003") {
        throw new AppError(409, "No se puede borrar un servicio que ya tiene turnos o lavados registrados");
      }
    }
    throw e;
  }
}
