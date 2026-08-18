import type { Cliente } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function findAll(): Promise<Cliente[]> {
  return prisma.cliente.findMany();
}

export async function findById(id: number): Promise<Cliente | null> {
  return prisma.cliente.findUnique({ where: { id } });
}

export async function create(datos: Omit<Cliente, "id">): Promise<Cliente> {
  return prisma.cliente.create({ data: datos });
}

// 1 sola query: Prisma lanza P2025 si el registro no existe
export async function update(id: number, datos: Partial<Omit<Cliente, "id">>): Promise<Cliente | null> {
  try {
    return await prisma.cliente.update({ where: { id }, data: datos });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

// 1 sola query: Prisma lanza P2025 si el registro no existe
export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.cliente.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return false;
    throw e;
  }
}
