// Reglas del negocio San José en un solo lugar (las usan services, validaciones y seed).

/** Horarios de atención para turnos: cada 30 minutos de 08:00 a 17:30. */
export const HORARIOS: readonly string[] = Array.from({ length: 20 }, (_, i) => {
  const minutos = 8 * 60 + i * 30;
  const hh = String(Math.floor(minutos / 60)).padStart(2, "0");
  const mm = String(minutos % 60).padStart(2, "0");
  return `${hh}:${mm}`;
});

/** Cuántos autos se atienden a la vez en un mismo horario (un box de trabajo). */
export const CUPOS_POR_HORARIO = 1;

/** Service de lubricentro: cada 10.000 km o cada 6 meses, lo que pase primero. */
export const SERVICE_CADA_KM = 10_000;
export const SERVICE_CADA_MESES = 6;

/** Margen para avisar que el service está cerca. */
export const AVISO_KM = 1_000;
export const AVISO_DIAS = 30;

export const TIPOS_SERVICIO = ["lavadero", "lubricentro"] as const;
export type TipoServicio = (typeof TIPOS_SERVICIO)[number];
