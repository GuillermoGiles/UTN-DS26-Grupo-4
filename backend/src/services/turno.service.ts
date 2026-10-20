import { Prisma, type Rol, type EstadoTurno } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";
import { HORARIOS, CUPOS_POR_HORARIO } from "../config/negocio";
import { turnoInclude, type TurnoConDetalle } from "../types/turno.types";
import { yaPaso } from "../utils/fechas";
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
  const turnos = await prisma.turno.findMany({
    where: { fecha, estado: { in: ESTADOS_QUE_OCUPAN } },
    select: { hora: true },
  });
  const usados = new Map<string, number>();
  for (const t of turnos) usados.set(t.hora, (usados.get(t.hora) ?? 0) + 1);

  const ocupados = HORARIOS.filter((h) => (usados.get(h) ?? 0) >= CUPOS_POR_HORARIO);
  return {
    fecha,
    horarios: HORARIOS,
    ocupados,
    libres: HORARIOS.filter((h) => !ocupados.includes(h)),
  };
}

async function verificarHorarioLibre(fecha: string, hora: string, excluirTurnoId?: number) {
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
  await verificarHorarioLibre(datos.fecha, datos.hora);

  return prisma.turno.create({
    data: { ...datos, clienteId },
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

  return prisma.turno.update({ where: { id }, data: datos, include: turnoInclude });
}

/**
 * Cambio de estado desde la agenda. Al completar un turno de lubricentro,
 * queda registrado el service del vehículo con su kilometraje actual.
 */
export async function cambiarEstado(id: number, estado: EstadoTurno): Promise<TurnoConDetalle | null> {
  try {
    const turno = await prisma.turno.update({ where: { id }, data: { estado }, include: turnoInclude });
    if (estado === "COMPLETADO" && turno.servicio.tipo === "lubricentro" && turno.vehiculo) {
      await prisma.vehiculo.update({
        where: { id: turno.vehiculo.id },
        data: { kmUltimoService: turno.vehiculo.km, fechaUltimoService: new Date() },
      });
    }
    return turno;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
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
