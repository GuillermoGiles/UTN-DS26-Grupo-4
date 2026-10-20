import type { Servicio } from './servicio';
import type { Vehiculo } from './vehiculo';
import type { Cliente } from './cliente';

export type EstadoTurno = 'PENDIENTE' | 'CONFIRMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';

export const ESTADOS_TURNO: EstadoTurno[] = ['PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'];

export interface Turno {
  id: number;
  fecha: string; // AAAA-MM-DD
  hora: string; // HH:MM
  estado: EstadoTurno;
  nota: string | null;
  createdAt: string;
  clienteId: number;
  vehiculoId: number | null;
  servicioId: number;
  recordatorioEnviado?: boolean;
}

/** GET /api/turnos, POST /api/turnos */
export interface TurnoConDetalle extends Turno {
  cliente: Cliente;
  servicio: Servicio;
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
