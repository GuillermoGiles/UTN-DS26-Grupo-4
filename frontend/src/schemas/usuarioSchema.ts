import { z } from 'zod';

export const usuarioSchema = z
  .object({
    nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    email: z.string().trim().email('Debe ingresar un email válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmar: z.string(),
    rol: z.enum(['EMPLEADO', 'ADMIN'], { message: 'Elegí el rol' }),
  })
  .refine((d) => d.password === d.confirmar, { path: ['confirmar'], message: 'Las contraseñas no coinciden' });

export type UsuarioForm = z.input<typeof usuarioSchema>;
