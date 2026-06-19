import { z } from 'zod';

export const usuarioSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre es demasiado largo"),
    apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50, "El apellido es demasiado largo"),
    email: z.string().email("Debe ingresar un email válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
