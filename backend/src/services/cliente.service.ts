import { Prisma, type Cliente } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";
import {
  clienteListadoInclude,
  clienteDetalleInclude,
  type ClienteListado,
  type ClienteDetalle,
} from "../types/cliente.types";
import { conService } from "./vehiculo.service";
import type { ClienteCreate, ClienteUpdate } from "../validations/cliente.validation";

export async function findAll(q?: string): Promise<ClienteListado[]> {
  const where: Prisma.ClienteWhereInput = q
    ? {
        OR: [
          { nombre: { contains: q, mode: "insensitive" } },
          { telefono: { contains: q } },
          { vehiculos: { some: { patente: { contains: q.replace(/[\s-]/g, "").toUpperCase() } } } },
        ],
      }
    : {};
  return prisma.cliente.findMany({ where, include: clienteListadoInclude, orderBy: { nombre: "asc" } });
}

function detalleConService(c: ClienteDetalle) {
  return { ...c, vehiculos: c.vehiculos.map(conService) };
}

export async function findById(id: number) {
  const c = await prisma.cliente.findUnique({ where: { id }, include: clienteDetalleInclude });
  return c ? detalleConService(c) : null;
}

/** La ficha del CLIENTE logueado (portal "Mi cuenta"). */
export async function findByUsuario(usuarioId: number) {
  const c = await prisma.cliente.findUnique({ where: { usuarioId }, include: clienteDetalleInclude });
  if (!c) throw new AppError(404, "Tu cuenta no tiene una ficha de cliente asociada");
  return detalleConService(c);
}

// Cliente + primer vehículo en una sola query (nested write: si falla uno, no se crea ninguno)
export async function create(datos: ClienteCreate): Promise<ClienteListado> {
  const { vehiculo, ...cliente } = datos;
  return prisma.cliente.create({
    data: {
      ...cliente,
      ...(vehiculo ? { vehiculos: { create: { ...vehiculo, km: vehiculo.km ?? 0 } } } : {}),
    },
    include: clienteListadoInclude,
  });
}

// 1 sola query: Prisma lanza P2025 si el registro no existe
export async function update(id: number, datos: ClienteUpdate): Promise<Cliente | null> {
  try {
    return await prisma.cliente.update({ where: { id }, data: datos });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

export async function updateByUsuario(usuarioId: number, datos: Pick<ClienteUpdate, "nombre" | "telefono">): Promise<Cliente> {
  try {
    return await prisma.cliente.update({ where: { usuarioId }, data: datos });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      throw new AppError(404, "Tu cuenta no tiene una ficha de cliente asociada");
    }
    throw e;
  }
}

// Los vehículos se borran en cascada; si tiene turnos, Postgres frena (Restrict) → 409
export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.cliente.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") return false;
      if (e.code === "P2003") {
        throw new AppError(409, "No se puede borrar un cliente con turnos registrados");
      }
    }
    throw e;
  }
}
