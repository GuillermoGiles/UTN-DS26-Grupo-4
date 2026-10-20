// Tipo alineado con el modelo Prisma del backend: GET /api/servicios
export type TipoServicio = 'lavadero' | 'lubricentro';

export type Servicio = {
  id: number;
  nombre: string;
  precio: number;
  desc: string;
  tipo: TipoServicio;
};
