export type Unidad = 'litros' | 'unidades';

export interface Insumo {
  id: number;
  nombre: string;
  unidad: Unidad;
  stock: number;
  stockMinimo: number;
  createdAt: string;
  bajo: boolean;
  servicios?: { cantidad: number; servicio: { id: number; nombre: string } }[];
}

export interface MovimientoStock {
  id: number;
  cantidad: number;
  motivo: string;
  fecha: string;
}

export interface InsumoDetalle extends Insumo {
  movimientos: MovimientoStock[];
}

export interface Correo {
  id: number;
  destinatario: string;
  asunto: string;
  cuerpo: string;
  estado: 'ENVIADO' | 'SIMULADO' | 'FALLIDO';
  error: string | null;
  createdAt: string;
  turnoId: number | null;
}

export interface ListadoCorreos {
  configurado: boolean;
  totales: { enviados: number; simulados: number; fallidos: number };
  correos: Correo[];
}
