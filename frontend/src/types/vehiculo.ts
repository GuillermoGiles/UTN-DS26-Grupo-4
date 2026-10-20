import type { Servicio } from './servicio';
import type { Turno } from './turno';

export type EstadoService = 'sin-datos' | 'ok' | 'proximo' | 'vencido';

/** Calculado por la API en cada respuesta (no se guarda en la base). */
export interface ProximoService {
  estado: EstadoService;
  proximoKm: number | null;
  proximaFecha: string | null;
}

export interface Vehiculo {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number | null;
  km: number;
  kmUltimoService: number | null;
  fechaUltimoService: string | null;
  createdAt: string;
  clienteId: number;
}

export interface TitularResumen {
  id: number;
  nombre: string;
  telefono: string;
}

/** GET /api/vehiculos */
export interface VehiculoListado extends Vehiculo {
  cliente: TitularResumen;
  service: ProximoService;
}

export interface LavadoDeVehiculo {
  id: number;
  fecha: string;
  precio: number;
  observaciones: string | null;
  servicio: Servicio;
  empleado: { id: number; nombre: string };
}

/** GET /api/vehiculos/:id */
export interface VehiculoDetalle extends VehiculoListado {
  turnos: (Turno & { servicio: Servicio })[];
  lavados: LavadoDeVehiculo[];
}

/** Vehículo dentro de la ficha de un cliente (con su próximo service) */
export interface VehiculoConService extends Vehiculo {
  service: ProximoService;
}
