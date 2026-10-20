import type { Lavado } from './lavado';
import type { TurnoConDetalle } from './turno';
import type { VehiculoListado } from './vehiculo';

/** GET /api/panel/resumen */
export interface ResumenPanel {
  fecha: string;
  turnosDelDia: number;
  turnosPendientes: number;
  vehiculosAtendidos: number;
  ingresosDelDia: number;
  agenda: TurnoConDetalle[];
  lavados: Lavado[];
  serviceAtrasado: VehiculoListado[];
}
