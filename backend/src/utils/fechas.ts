// El negocio está en La Plata: "hoy" se calcula en la hora de Argentina,
// no en la del servidor (en un deploy en la nube el servidor suele estar en UTC).
const ZONA = "America/Argentina/Buenos_Aires";

/** Fecha de hoy en Argentina con formato YYYY-MM-DD. */
export function hoyAR(base: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(base);
}

/** Suma (o resta) días a una fecha YYYY-MM-DD. */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Inicio y fin (exclusivo) de un día de Argentina, como Date para filtrar DateTime. */
export function rangoDelDia(fecha: string): { desde: Date; hasta: Date } {
  return {
    desde: new Date(`${fecha}T00:00:00-03:00`),
    hasta: new Date(`${sumarDias(fecha, 1)}T00:00:00-03:00`),
  };
}
