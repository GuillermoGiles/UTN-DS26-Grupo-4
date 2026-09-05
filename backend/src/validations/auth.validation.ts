import { z } from "zod";

export const registroSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().trim().email("El formato de email no es válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(["ADMIN", "EMPLEADO", "CLIENTE"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("El formato de email no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
