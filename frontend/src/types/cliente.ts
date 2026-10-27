import type { Turno } from './turno';
import type { Vehiculo, VehiculoConService } from './vehiculo';

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  dni: string | null;
  email: string | null;
  createdAt: string;
  usuarioId: number | null;
}

/** GET /api/clientes */
export interface ClienteListado extends Cliente {
  vehiculos: Pick<Vehiculo, 'id' | 'patente' | 'marca' | 'modelo'>[];
  _count: { turnos: number };
}

/** GET /api/clientes/:id y GET /api/clientes/mio */
export interface ClienteDetalle extends Cliente {
  vehiculos: VehiculoConService[];
  turnos: (Turno & { vehiculo: Vehiculo | null })[];
}
