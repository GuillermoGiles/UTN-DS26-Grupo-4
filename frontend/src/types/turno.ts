import type { Servicio } from './servicio';
import type { Vehiculo } from './vehiculo';
import type { Cliente } from './cliente';

export type EstadoTurno = 'PENDIENTE' | 'CONFIRMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';

export const ESTADOS_TURNO: EstadoTurno[] = ['PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'];

/** Renglón de la tabla intermedia Turno ↔ Servicio. */
export interface TurnoServicio {
  servicioId: number;
  servicio: Servicio;
}

/** "Cambio de Aceite + Lavado Básico" y la suma de precios. */
export const nombresServicios = (t: { servicios: TurnoServicio[] }) => t.servicios.map((s) => s.servicio.nombre).join(' + ');
export const totalServicios = (t: { servicios: TurnoServicio[] }) => t.servicios.reduce((s, ts) => s + ts.servicio.precio, 0);

export interface Turno {
  id: number;
  fecha: string; // AAAA-MM-DD
  hora: string; // HH:MM
  estado: EstadoTurno;
  nota: string | null;
  createdAt: string;
  clienteId: number;
  vehiculoId: number | null;
  servicios: TurnoServicio[]; // N:M: uno o más servicios por turno
  recordatorioEnviado?: boolean;
}

/** GET /api/turnos, POST /api/turnos */
export interface TurnoConDetalle extends Turno {
  cliente: Cliente;
  vehiculo: Vehiculo | null;
}

/** GET /api/turnos/disponibles?fecha= */
export interface Disponibilidad {
  fecha: string;
  cerrado?: boolean;
  horarios: string[];
  ocupados: string[];
  libres: string[];
}
