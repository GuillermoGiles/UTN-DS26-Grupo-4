import { z } from 'zod';

export const lavadoSchema = z.object({
  patente: z.string().trim().min(6, 'La patente debe tener al menos 6 caracteres').max(7, 'Patente inválida'),
  modelo: z.string().trim().min(2, 'Debe ingresar el modelo del vehículo'),
  tipoLavado: z.string().min(1, 'Debe seleccionar un tipo de lavado'),
  empleado: z.string().min(1, 'Debe asignar un empleado'),
});

// Zod nos regala el tipo de TypeScript automáticamente
export type LavadoValidado = z.infer<typeof lavadoSchema>;