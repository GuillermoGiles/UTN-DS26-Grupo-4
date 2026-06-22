import { z } from 'zod';

export const turnoSchema = z.object({
  fecha: z.string().min(1, 'Debe seleccionar una fecha válida'),
  hora: z.string().min(1, 'Debe seleccionar un horario'),
  cliente: z.string().trim().min(3, 'El nombre del cliente o patente debe tener al menos 3 caracteres'),
  tipoServicio: z.string().min(1, 'Debe seleccionar el tipo de servicio a realizar'),
});

export type TurnoValidado = z.infer<typeof turnoSchema>;