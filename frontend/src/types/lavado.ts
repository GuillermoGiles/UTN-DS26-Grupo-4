import type { Servicio } from './servicio';
import type { Vehiculo } from './vehiculo';

/** GET /api/lavados */
export interface Lavado {
  id: number;
  fecha: string;
  precio: number;
  observaciones: string | null;
  vehiculoId: number;
  servicioId: number;
  empleadoId: number;
  vehiculo: Vehiculo & { cliente: { id: number; nombre: string } };
  servicio: Servicio;
  empleado: { id: number; nombre: string };
}
