// Tipo alineado con el modelo Prisma del backend
// GET /api/servicios devuelve objetos con esta forma
export type Servicio = {
  id: number;
  nombre: string;
  precio: number;
  desc: string;
  tipo: 'lavadero' | 'lubricentro';
};
