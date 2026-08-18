import type { Cliente } from "@prisma/client";
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

export async function update(id: number, datos: Partial<Omit<Cliente, "id">>): Promise<Cliente | null> {
  const existe = await prisma.cliente.findUnique({ where: { id } });
  if (!existe) return null;

  return prisma.cliente.update({
    where: { id },
    data: datos,
  });
}

export async function remove(id: number): Promise<boolean> {
  const existe = await prisma.cliente.findUnique({ where: { id } });
  if (!existe) return false;

  await prisma.cliente.delete({ where: { id } });
  return true;
}
