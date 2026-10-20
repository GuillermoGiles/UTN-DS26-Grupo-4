import { prisma } from "../config/prisma";
import { hoyAR, rangoDelDia } from "../utils/fechas";
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

  return {
    fecha,
    turnosDelDia: turnosDelDia.length,
    turnosPendientes: pendientes,
    vehiculosAtendidos: completados.length + lavadosDelDia.length,
    ingresosDelDia: ingresosTurnos + ingresosLavados,
    agenda: turnosDelDia,
    lavados: lavadosDelDia,
    serviceAtrasado,
  };
}
