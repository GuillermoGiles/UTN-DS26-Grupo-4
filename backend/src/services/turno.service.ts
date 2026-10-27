import { Prisma, type Rol, type EstadoTurno } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";
import { HORARIOS, CUPOS_POR_HORARIO } from "../config/negocio";
import { turnoInclude, type TurnoConDetalle } from "../types/turno.types";
import { esDomingo, yaPaso } from "../utils/fechas";
import { descontarPorServicio } from "./insumo.service";
import type { TurnoCreate, TurnoUpdate } from "../validations/turno.validation";

type UsuarioSesion = { id: number; rol: Rol };

const ESTADOS_QUE_OCUPAN: EstadoTurno[] = ["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "COMPLETADO"];

export async function findAll(filtros: { fecha?: string; estado?: EstadoTurno } = {}): Promise<TurnoConDetalle[]> {
  return prisma.turno.findMany({
    where: { fecha: filtros.fecha, estado: filtros.estado },
    include: turnoInclude,
    orderBy: [{ fecha: "asc" }, { hora: "asc" }],
  });
}

export async function findById(id: number): Promise<TurnoConDetalle | null> {
  return prisma.turno.findUnique({ where: { id }, include: turnoInclude });
}

/** Horarios del día con su disponibilidad (los cancelados liberan el lugar). */
export async function disponibles(fecha: string) {
  if (esDomingo(fecha)) return { fecha, cerrado: true, horarios: HORARIOS, ocupados: [...HORARIOS], libres: [] };
  const turnos = await prisma.turno.findMany({
    where: { fecha, estado: { in: ESTADOS_QUE_OCUPAN } },
    select: { hora: true },
  });
  const usados = new Map<string, number>();
  for (const t of turnos) usados.set(t.hora, (usados.get(t.hora) ?? 0) + 1);

  const ocupados = HORARIOS.filter((h) => (usados.get(h) ?? 0) >= CUPOS_POR_HORARIO);
  return {
    fecha,
    cerrado: false,
    horarios: HORARIOS,
    ocupados,
    libres: HORARIOS.filter((h) => !ocupados.includes(h)),
  };
}

async function verificarHorarioLibre(fecha: string, hora: string, excluirTurnoId?: number) {
  if (esDomingo(fecha)) throw new AppError(400, "El taller no atiende los domingos");
  if (yaPaso(fecha, hora)) {
    throw new AppError(400, "No se pueden reservar turnos en un día u horario que ya pasó");
  }
  const ocupacion = await prisma.turno.count({
    where: {
      fecha,
      hora,
      estado: { in: ESTADOS_QUE_OCUPAN },
      ...(excluirTurnoId ? { id: { not: excluirTurnoId } } : {}),
    },
  });
  if (ocupacion >= CUPOS_POR_HORARIO) {
    throw new AppError(409, `El horario ${hora} del ${fecha} ya está ocupado`);
  }
}

async function verificarVehiculoDelCliente(vehiculoId: number, clienteId: number) {
  const vehiculo = await prisma.vehiculo.findUnique({ where: { id: vehiculoId } });
  if (!vehiculo) throw new AppError(400, "El vehículo no existe");
  if (vehiculo.clienteId !== clienteId) {
    throw new AppError(400, "El vehículo no pertenece a ese cliente");
  }
}

/**
 * Los servicios del turno tienen que existir y, como máximo, uno puede ser de lavadero
 * (no tiene sentido un Lavado Básico y un Premium en el mismo turno). Los de lubricentro
 * se combinan libremente. Es regla de negocio: necesita el tipo de cada servicio (la base).
 */
async function verificarServicios(servicioIds: number[]) {
  const servicios = await prisma.servicio.findMany({ where: { id: { in: servicioIds } } });
  if (servicios.length !== servicioIds.length) throw new AppError(400, "Alguno de los servicios no existe");
  if (servicios.filter((s) => s.tipo === "lavadero").length > 1) {
    throw new AppError(400, "Solo se puede elegir un servicio de lavadero por turno");
  }
}

/** Renglones de la tabla intermedia para un create/update anidado de Prisma. */
const renglones = (servicioIds: number[]) => servicioIds.map((servicioId) => ({ servicioId }));

/**
 * Reserva. Un CLIENTE siempre reserva para su propia ficha (se ignora el clienteId del body,
 * así no puede sacar turnos a nombre de otro). EMPLEADO/ADMIN indican el cliente.
 */
export async function create(datos: TurnoCreate, usuario: UsuarioSesion): Promise<TurnoConDetalle> {
  let clienteId = datos.clienteId;
  if (usuario.rol === "CLIENTE") {
    const propio = await prisma.cliente.findUnique({ where: { usuarioId: usuario.id } });
    if (!propio) throw new AppError(400, "Tu cuenta no tiene una ficha de cliente asociada");
    clienteId = propio.id;
  }
  if (!clienteId) throw new AppError(400, "Indicá el cliente del turno");

  if (datos.vehiculoId) await verificarVehiculoDelCliente(datos.vehiculoId, clienteId);
  await verificarServicios(datos.servicioIds);
  await verificarHorarioLibre(datos.fecha, datos.hora);

  const { servicioIds, ...resto } = datos;
  return prisma.turno.create({
    data: { ...resto, clienteId, servicios: { create: renglones(servicioIds) } },
    include: turnoInclude,
  });
}

/** Turnos del CLIENTE logueado. */
export async function misTurnos(usuarioId: number): Promise<TurnoConDetalle[]> {
  return prisma.turno.findMany({
    where: { cliente: { usuarioId } },
    include: turnoInclude,
    orderBy: [{ fecha: "desc" }, { hora: "desc" }],
  });
}

// Edición completa (EMPLEADO / ADMIN): si cambia el horario, se vuelve a verificar
export async function update(id: number, datos: TurnoUpdate): Promise<TurnoConDetalle | null> {
  const actual = await prisma.turno.findUnique({ where: { id } });
  if (!actual) return null;

  const fecha = datos.fecha ?? actual.fecha;
  const hora = datos.hora ?? actual.hora;
  if (fecha !== actual.fecha || hora !== actual.hora) await verificarHorarioLibre(fecha, hora, id);

  const clienteId = datos.clienteId ?? actual.clienteId;
  if (datos.vehiculoId) await verificarVehiculoDelCliente(datos.vehiculoId, clienteId);
  if (datos.servicioIds) await verificarServicios(datos.servicioIds);

  // Si vienen servicios, reemplazan a los anteriores (se borran los renglones y se crean los nuevos)
  const { servicioIds, ...resto } = datos;
  return prisma.turno.update({
    where: { id },
    data: { ...resto, ...(servicioIds ? { servicios: { deleteMany: {}, create: renglones(servicioIds) } } : {}) },
    include: turnoInclude,
  });
}

/**
 * Cambio de estado desde la agenda. Al completar un turno con algún servicio de lubricentro,
 * queda registrado el service del vehículo con su kilometraje actual.
 */
export async function cambiarEstado(id: number, estado: EstadoTurno): Promise<TurnoConDetalle | null> {
  const actual = await prisma.turno.findUnique({ where: { id }, include: turnoInclude });
  if (!actual) return null;

  return prisma.$transaction(async (tx) => {
    const completa = estado === "COMPLETADO" && !actual.stockDescontado;
    const turno = await tx.turno.update({
      where: { id },
      data: { estado, ...(completa ? { stockDescontado: true } : {}) },
      include: turnoInclude,
    });
    if (completa) {
      // Descuento automático de insumos de cada servicio (una sola vez por turno)
      for (const { servicio } of turno.servicios) {
        await descontarPorServicio(tx, servicio.id, `Turno #${turno.id} · ${servicio.nombre}`);
      }
      // Si incluye algún servicio de lubricentro, queda registrado el service con el km actual
      if (turno.servicios.some(({ servicio }) => servicio.tipo === "lubricentro") && turno.vehiculo) {
        await tx.vehiculo.update({
          where: { id: turno.vehiculo.id },
          data: { kmUltimoService: turno.vehiculo.km, fechaUltimoService: new Date() },
        });
      }
    }
    return turno;
  });
}

/** Cancelación: el CLIENTE solo puede cancelar los suyos y solo si todavía no empezaron. */
export async function cancelar(id: number, usuario: UsuarioSesion): Promise<TurnoConDetalle | null> {
  const turno = await prisma.turno.findUnique({ where: { id }, include: { cliente: true } });
  if (!turno) return null;

  if (usuario.rol === "CLIENTE") {
    if (turno.cliente.usuarioId !== usuario.id) {
      throw new AppError(403, "No tenés permiso para esta operación");
    }
    if (turno.estado !== "PENDIENTE" && turno.estado !== "CONFIRMADO") {
      throw new AppError(409, "Solo se pueden cancelar turnos pendientes o confirmados");
    }
  }
  if (turno.estado === "COMPLETADO") {
    throw new AppError(409, "No se puede cancelar un turno completado");
  }

  return prisma.turno.update({ where: { id }, data: { estado: "CANCELADO" }, include: turnoInclude });
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
