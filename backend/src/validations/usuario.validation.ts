import { z } from "zod";
export { idParamSchema } from "./common.validation";

// Alta de personal: solo un ADMIN, y solo roles internos.
// Los clientes se crean solos con POST /api/auth/registro.
export const usuarioCreateSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().trim().toLowerCase().email("El formato de email no es válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(["ADMIN", "EMPLEADO"], { message: "El rol debe ser ADMIN o EMPLEADO" }),
});

export const usuarioUpdateSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100).optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  rol: z.enum(["ADMIN", "EMPLEADO", "CLIENTE"], { message: "Rol inválido" }).optional(),
});

export type UsuarioCreate = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdate = z.infer<typeof usuarioUpdateSchema>;
