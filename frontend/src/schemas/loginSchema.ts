import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Debe ser un email válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
