/** Fecha de hoy en Argentina, AAAA-MM-DD (la que usa la API para turnos). */
export function hoyAR(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** "2026-10-20" → "mar 20/10" */
export function fechaCorta(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00`);
  const dia = d.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '');
  return `${dia} ${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;
}

/** ISO → "20/10/2026" */
export function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
}

/** ISO → "14:35" en hora de Argentina */
export function horaDe(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export function pesos(monto: number): string {
  return `$${monto.toLocaleString('es-AR')}`;
}

export function km(valor: number): string {
  return `${valor.toLocaleString('es-AR')} km`;
}

/** "ab 123-cd" → "AB123CD" (misma regla que el backend) */
export function normalizarPatente(patente: string): string {
  return patente.replace(/[\s-]/g, '').toUpperCase();
}

/** "AB123CD" → "AB 123 CD", "ABC123" → "ABC 123" (solo para mostrar) */
export function mostrarPatente(patente: string): string {
  if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(patente)) return `${patente.slice(0, 2)} ${patente.slice(2, 5)} ${patente.slice(5)}`;
  if (/^[A-Z]{3}\d{3}$/.test(patente)) return `${patente.slice(0, 3)} ${patente.slice(3)}`;
  return patente;
}

export function mensajeDeError(err: unknown, porDefecto = 'Ocurrió un error inesperado'): string {
  return err instanceof Error ? err.message : porDefecto;
}

/** Suma (o resta) días a una fecha AAAA-MM-DD. */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Hora actual en Argentina, HH:MM (para no ofrecer horarios que ya pasaron hoy). */
export function horaActualAR(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());
}

/** "Guillermo Giles" → "GG" (avatar) */
export function iniciales(nombre: string): string {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}
