import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";
import { correoConfigurado, obtenerTransporter, remitente } from "../config/mail";
import { hoyAR, sumarDias } from "../utils/fechas";

type DatosCorreo = { destinatario: string; asunto: string; cuerpo: string; turnoId?: number };

/** Envía (o simula, si no hay SMTP) y deja registro del intento. */
export async function enviar({ destinatario, asunto, cuerpo, turnoId }: DatosCorreo) {
  const transporter = obtenerTransporter();
  if (!transporter) {
    return prisma.correo.create({ data: { destinatario, asunto, cuerpo, turnoId, estado: "SIMULADO" } });
  }
  try {
    await transporter.sendMail({ from: remitente, to: destinatario, subject: asunto, text: cuerpo });
    return prisma.correo.create({ data: { destinatario, asunto, cuerpo, turnoId, estado: "ENVIADO" } });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return prisma.correo.create({ data: { destinatario, asunto, cuerpo, turnoId, estado: "FALLIDO", error } });
  }
}

function textoRecordatorio(t: { fecha: string; hora: string; cliente: { nombre: string }; servicios: { servicio: { nombre: string } }[]; vehiculo: { patente: string } | null }) {
  const auto = t.vehiculo ? ` para tu vehículo ${t.vehiculo.patente}` : "";
  return [
    `Hola ${t.cliente.nombre.split(" ")[0]},`,
    "",
    `Te recordamos tu turno de ${t.servicios.map((s) => s.servicio.nombre).join(" + ")}${auto} el ${t.fecha} a las ${t.hora} hs.`,
    "Si no podés venir, cancelalo desde Mi cuenta o avisanos por teléfono.",
    "",
    "Lavadero y Lubricentro San José",
  ].join("\n");
}

/** Recordatorio de un turno puntual (botón en la agenda). */
export async function recordatorioDeTurno(turnoId: number) {
  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
    include: { cliente: true, servicios: { include: { servicio: true } }, vehiculo: true },
  });
  if (!turno) return null;
  if (!turno.cliente.email) throw new AppError(400, "El cliente no tiene e-mail cargado");
  if (turno.estado === "CANCELADO" || turno.estado === "COMPLETADO") {
    throw new AppError(409, "El turno ya no está activo");
  }
  const correo = await enviar({
    destinatario: turno.cliente.email,
    asunto: `Recordatorio: tu turno del ${turno.fecha} a las ${turno.hora}`,
    cuerpo: textoRecordatorio(turno),
    turnoId,
  });
  await prisma.turno.update({ where: { id: turnoId }, data: { recordatorioEnviado: true } });
  return correo;
}

/**
 * Recordatorios automáticos: a cada turno activo de mañana que todavía no lo recibió.
 * Lo corre el programador de index.ts cada hora, y también se puede disparar a mano.
 */
export async function enviarRecordatoriosDeManana() {
  const manana = sumarDias(hoyAR(), 1);
  const turnos = await prisma.turno.findMany({
    where: {
      fecha: manana,
      estado: { in: ["PENDIENTE", "CONFIRMADO"] },
      recordatorioEnviado: false,
      cliente: { email: { not: null } },
    },
    select: { id: true },
  });
  for (const t of turnos) await recordatorioDeTurno(t.id);
  return { fecha: manana, enviados: turnos.length };
}

export async function listado() {
  const [correos, porEstado] = await Promise.all([
    prisma.correo.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.correo.groupBy({ by: ["estado"], _count: { _all: true } }),
  ]);
  const cuenta = (e: string) => porEstado.find((p) => p.estado === e)?._count._all ?? 0;
  return {
    configurado: correoConfigurado,
    totales: { enviados: cuenta("ENVIADO"), simulados: cuenta("SIMULADO"), fallidos: cuenta("FALLIDO") },
    correos,
  };
}
