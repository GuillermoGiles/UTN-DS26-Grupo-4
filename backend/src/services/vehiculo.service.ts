import { Prisma, type Rol, type Vehiculo } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";
import { calcularProximoService } from "../utils/service";
import { normalizarPatente } from "../utils/patente";
import {
  vehiculoListadoInclude,
  vehiculoDetalleInclude,
  type VehiculoListado,
  type VehiculoDetalle,
  type ConService,
} from "../types/vehiculo.types";
import type { VehiculoCreate, VehiculoUpdate } from "../validations/vehiculo.validation";

/** Agrega el cálculo del próximo service (no se guarda: depende de "hoy"). */
export function conService<T extends Vehiculo>(v: T): ConService<T> {
  return { ...v, service: calcularProximoService(v) };
}

export async function findAll(q?: string): Promise<ConService<VehiculoListado>[]> {
  const where: Prisma.VehiculoWhereInput = q
    ? {
        OR: [
          { patente: { contains: normalizarPatente(q) } },
          { marca: { contains: q, mode: "insensitive" } },
          { modelo: { contains: q, mode: "insensitive" } },
          { cliente: { nombre: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};
  const vehiculos = await prisma.vehiculo.findMany({
    where,
    include: vehiculoListadoInclude,
    orderBy: { patente: "asc" },
  });
  return vehiculos.map(conService);
}

export async function findById(id: number): Promise<ConService<VehiculoDetalle> | null> {
  const v = await prisma.vehiculo.findUnique({ where: { id }, include: vehiculoDetalleInclude });
  return v ? conService(v) : null;
}

/** Un CLIENTE carga autos solo a su nombre; EMPLEADO/ADMIN tienen que indicar el titular. */
async function resolverClienteId(
  clienteIdPedido: number | undefined,
  usuario: { id: number; rol: Rol },
): Promise<number> {
  if (usuario.rol === "CLIENTE") {
    const propio = await prisma.cliente.findUnique({ where: { usuarioId: usuario.id } });
    if (!propio) throw new AppError(400, "Tu cuenta no tiene una ficha de cliente asociada");
    return propio.id;
  }
  if (!clienteIdPedido) throw new AppError(400, "Indicá el cliente titular del vehículo");
  return clienteIdPedido;
}

export async function create(datos: VehiculoCreate, usuario: { id: number; rol: Rol }): Promise<VehiculoListado> {
  const { clienteId: pedido, ...resto } = datos;
  const clienteId = await resolverClienteId(pedido, usuario);
  return prisma.vehiculo.create({
    data: { ...resto, km: resto.km ?? 0, clienteId },
    include: vehiculoListadoInclude,
  });
}

// 1 sola query: Prisma lanza P2025 si el registro no existe
export async function update(id: number, datos: VehiculoUpdate): Promise<VehiculoListado | null> {
  try {
    return await prisma.vehiculo.update({ where: { id }, data: datos, include: vehiculoListadoInclude });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

/** Registra que se hizo el service hoy con los km indicados (actualiza también el odómetro). */
export async function registrarService(id: number, km: number): Promise<ConService<Vehiculo> | null> {
  const actual = await prisma.vehiculo.findUnique({ where: { id } });
  if (!actual) return null;
  if (km < (actual.kmUltimoService ?? 0)) {
    throw new AppError(400, "Los km no pueden ser menores a los del último service");
  }
  const v = await prisma.vehiculo.update({
    where: { id },
    data: { km: Math.max(km, actual.km), kmUltimoService: km, fechaUltimoService: new Date() },
  });
  return conService(v);
}

export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.vehiculo.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return false;
    throw e;
  }
}
