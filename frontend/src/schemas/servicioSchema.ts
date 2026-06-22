import { z } from 'zod';

export const servicioSchema = z.object({
  nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  desc: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres'),
  tipo: z.enum(['lavadero', 'lubricentro'], { 
    message: 'Debes seleccionar un tipo de servicio válido',
  })
});

export type ServicioValidado = z.infer<typeof servicioSchema>;
