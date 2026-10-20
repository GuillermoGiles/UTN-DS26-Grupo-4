import {
  SERVICE_CADA_KM,
  SERVICE_CADA_MESES,
  AVISO_KM,
  AVISO_DIAS,
} from "../config/negocio";

export type EstadoService = "sin-datos" | "ok" | "proximo" | "vencido";

export interface DatosService {
  km: number;
  kmUltimoService: number | null;
  fechaUltimoService: Date | null;
}

export interface ProximoService {
  estado: EstadoService;
  /** Kilometraje en el que toca el próximo service (null si no hay datos). */
  proximoKm: number | null;
  /** Fecha límite del próximo service (null si no hay datos). */
  proximaFecha: Date | null;
}

/**
 * Regla de lubricentro: el service vence a los 10.000 km o a los 6 meses del último,
 * lo que pase primero. Avisa "proximo" cuando faltan menos de 1.000 km o 30 días.
 * Función pura (sin DB): se testea sola, ver service.test.ts.
 */
export function calcularProximoService(v: DatosService, hoy: Date = new Date()): ProximoService {
  if (v.kmUltimoService === null && v.fechaUltimoService === null) {
    return { estado: "sin-datos", proximoKm: null, proximaFecha: null };
  }

  const proximoKm = v.kmUltimoService !== null ? v.kmUltimoService + SERVICE_CADA_KM : null;
  let proximaFecha: Date | null = null;
  if (v.fechaUltimoService) {
    proximaFecha = new Date(v.fechaUltimoService);
    proximaFecha.setMonth(proximaFecha.getMonth() + SERVICE_CADA_MESES);
  }

  const kmRestantes = proximoKm !== null ? proximoKm - v.km : Infinity;
  const diasRestantes =
    proximaFecha !== null ? (proximaFecha.getTime() - hoy.getTime()) / 86_400_000 : Infinity;

  let estado: EstadoService = "ok";
  if (kmRestantes <= 0 || diasRestantes <= 0) estado = "vencido";
  else if (kmRestantes <= AVISO_KM || diasRestantes <= AVISO_DIAS) estado = "proximo";

  return { estado, proximoKm, proximaFecha };
}
