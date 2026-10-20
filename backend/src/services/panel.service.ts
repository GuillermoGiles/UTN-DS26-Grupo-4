import { prisma } from "../config/prisma";
import { hoyAR, rangoDelDia, sumarDias } from "../utils/fechas";
import { findBajos } from "./insumo.service";
import { turnoInclude } from "../types/turno.types";
import { lavadoInclude } from "./lavado.service";
import { conService } from "./vehiculo.service";

/** Resumen del día para el panel del ADMIN, calculado con los datos reales. */
export async function resumen(fecha: string = hoyAR()) {
  const { desde, hasta } = rangoDelDia(fecha);

  const [turnosDelDia, lavadosDelDia, pendientes, vehiculos] = await Promise.all([
    prisma.turno.findMany({ where: { fecha }, include: turnoInclude, orderBy: { hora: "asc" } }),
    prisma.lavado.findMany({ where: { fecha: { gte: desde, lt: hasta } }, include: lavadoInclude, orderBy: { fecha: "desc" } }),
    prisma.turno.count({ where: { fecha: { gte: fecha }, estado: { in: ["PENDIENTE", "CONFIRMADO"] } } }),
    prisma.vehiculo.findMany({ include: { cliente: { select: { id: true, nombre: true, telefono: true } } } }),
  ]);

  const completados = turnosDelDia.filter((t) => t.estado === "COMPLETADO");
  const ingresosTurnos = completados.reduce((suma, t) => suma + t.servicio.precio, 0);
  const ingresosLavados = lavadosDelDia.reduce((suma, l) => suma + l.precio, 0);

  const serviceAtrasado = vehiculos
    .map(conService)
    .filter((v) => v.service.estado === "vencido" || v.service.estado === "proximo")
    .sort((a, b) => (a.service.estado === b.service.estado ? 0 : a.service.estado === "vencido" ? -1 : 1));

  // Caja de los últimos 7 días (turnos completados + lavados), para el gráfico semanal
  const desdeSemana = sumarDias(fecha, -6);
  const [turnosSemana, lavadosSemana, insumosBajos] = await Promise.all([
    prisma.turno.findMany({
      where: { fecha: { gte: desdeSemana, lte: fecha }, estado: "COMPLETADO" },
      select: { fecha: true, servicio: { select: { precio: true } } },
    }),
    prisma.lavado.findMany({
      where: { fecha: { gte: rangoDelDia(desdeSemana).desde, lt: hasta } },
      select: { fecha: true, precio: true },
    }),
    findBajos(),
  ]);
  const semana = Array.from({ length: 7 }, (_, i) => {
    const dia = sumarDias(desdeSemana, i);
    const { desde: d, hasta: h } = rangoDelDia(dia);
    const total =
      turnosSemana.filter((t) => t.fecha === dia).reduce((s, t) => s + t.servicio.precio, 0) +
      lavadosSemana.filter((l) => l.fecha >= d && l.fecha < h).reduce((s, l) => s + l.precio, 0);
    return { fecha: dia, total };
  });

  const estados = Object.fromEntries(
    (["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "COMPLETADO", "CANCELADO"] as const).map((e) => [
      e,
      turnosDelDia.filter((t) => t.estado === e).length,
    ]),
  );

  return {
    fecha,
    semana,
    estados,
    insumosBajos,
    turnosDelDia: turnosDelDia.length,
    turnosPendientes: pendientes,
    vehiculosAtendidos: completados.length + lavadosDelDia.length,
    ingresosDelDia: ingresosTurnos + ingresosLavados,
    agenda: turnosDelDia,
    lavados: lavadosDelDia,
    serviceAtrasado,
  };
}
