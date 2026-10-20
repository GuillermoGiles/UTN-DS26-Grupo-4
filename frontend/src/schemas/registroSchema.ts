import { z } from 'zod';
import { telefono } from './campos';

export const registroSchema = z
  .object({
    nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().trim().email('Debe ser un email válido'),
    telefono,
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmar: z.string(),
  })
  .refine((d) => d.password === d.confirmar, {
    path: ['confirmar'],
    message: 'Las contraseñas no coinciden',
  });

export type RegistroForm = z.input<typeof registroSchema>;
