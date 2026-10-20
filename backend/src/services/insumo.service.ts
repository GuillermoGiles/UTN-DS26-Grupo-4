import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";
import type { InsumoCreate, InsumoUpdate } from "../validations/insumo.validation";

type Tx = Prisma.TransactionClient;

/** Un insumo está "bajo" cuando llegó al stock mínimo (alerta visual del panel). */
const conAlerta = <T extends { stock: number; stockMinimo: number }>(i: T) => ({ ...i, bajo: i.stock <= i.stockMinimo });

export async function findAll() {
  const insumos = await prisma.insumo.findMany({
    orderBy: { nombre: "asc" },
    include: { servicios: { include: { servicio: { select: { id: true, nombre: true } } } } },
  });
  return insumos.map(conAlerta);
}

export async function findById(id: number) {
  const insumo = await prisma.insumo.findUnique({
    where: { id },
    include: {
      servicios: { include: { servicio: { select: { id: true, nombre: true } } } },
      movimientos: { orderBy: { fecha: "desc" }, take: 30 },
    },
  });
  return insumo ? conAlerta(insumo) : null;
}

export async function findBajos() {
  const insumos = await prisma.insumo.findMany({ orderBy: { nombre: "asc" } });
  return insumos.map(conAlerta).filter((i) => i.bajo);
}

// Alta con la carga inicial registrada como primer movimiento
export async function create(datos: InsumoCreate) {
  const insumo = await prisma.insumo.create({
    data: {
      ...datos,
      movimientos: datos.stock > 0 ? { create: { cantidad: datos.stock, motivo: "Carga inicial" } } : undefined,
    },
  });
  return conAlerta(insumo);
}

export async function update(id: number, datos: InsumoUpdate) {
  try {
    return conAlerta(await prisma.insumo.update({ where: { id }, data: datos }));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.insumo.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return false;
    throw e;
  }
}

/** Carga (cantidad > 0) o ajuste (cantidad < 0) manual de stock, con su movimiento. */
export async function ajustar(id: number, cantidad: number, motivo: string) {
  return prisma.$transaction(async (tx) => {
    const actual = await tx.insumo.findUnique({ where: { id } });
    if (!actual) return null;
    if (actual.stock + cantidad < 0) {
      throw new AppError(400, `No hay suficiente stock: quedan ${actual.stock} ${actual.unidad}`);
    }
    const insumo = await tx.insumo.update({ where: { id }, data: { stock: { increment: cantidad } } });
    await tx.movimientoStock.create({ data: { insumoId: id, cantidad, motivo } });
    return conAlerta(insumo);
  });
}

/**
 * Descuento automático al terminar un servicio: resta lo que indica la receta del servicio.
 * Nunca frena el trabajo (el servicio ya se hizo): si no alcanza, el stock queda en 0
 * y el insumo aparece en las alertas.
 */
export async function descontarPorServicio(tx: Tx, servicioId: number, motivo: string) {
  const receta = await tx.servicioInsumo.findMany({ where: { servicioId }, include: { insumo: true } });
  for (const r of receta) {
    const consumo = Math.min(r.cantidad, r.insumo.stock);
    if (consumo <= 0) continue;
    await tx.insumo.update({ where: { id: r.insumoId }, data: { stock: { decrement: consumo } } });
    await tx.movimientoStock.create({ data: { insumoId: r.insumoId, cantidad: -consumo, motivo } });
  }
}

/** Reemplaza la receta de un servicio (qué insumos y cuánto consume cada vez). */
export async function definirReceta(servicioId: number, items: { insumoId: number; cantidad: number }[]) {
  const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
  if (!servicio) return null;
  await prisma.$transaction([
    prisma.servicioInsumo.deleteMany({ where: { servicioId } }),
    prisma.servicioInsumo.createMany({ data: items.map((i) => ({ ...i, servicioId })) }),
  ]);
  return prisma.servicioInsumo.findMany({ where: { servicioId }, include: { insumo: true } });
}
