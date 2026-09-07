import { z } from 'zod';

export const clienteSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  vehiculo: z.string().trim().min(1, 'El vehículo es obligatorio'),
  patente: z.string().trim().min(1, 'La patente es obligatoria'),
  telefono: z.string().trim().min(1, 'El teléfono es obligatorio'),
});

export type ClienteValidado = z.infer<typeof clienteSchema>;

// Tipo alineado con el modelo Prisma del backend
// GET /api/clientes devuelve objetos con esta forma (requiere auth ADMIN o EMPLEADO)
export interface Cliente extends ClienteValidado {
  id: number;
}
