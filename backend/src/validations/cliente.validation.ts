import { z } from "zod";
import { vehiculoDatosSchema } from "./vehiculo.validation";
export { idParamSchema } from "./common.validation";

// "28.456.921" → "28456921"; DNI argentino de 7 u 8 dígitos
export const dniSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => /^\d{7,8}$/.test(v), "El DNI debe tener 7 u 8 números");

const clienteDatosSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  telefono: z.string().trim().min(6, "El teléfono debe tener al menos 6 caracteres").max(20),
  email: z.string().trim().toLowerCase().email("El formato de email no es válido").optional(),
  dni: dniSchema.optional(),
});

// El alta puede traer el primer vehículo del cliente (se crean juntos, en una sola query)
export const clienteCreateSchema = clienteDatosSchema.extend({
  vehiculo: vehiculoDatosSchema.optional(),
});

export const clienteUpdateSchema = clienteDatosSchema.partial();

// Lo que un CLIENTE puede editar de su propia ficha (el email es el de su cuenta)
export const clienteMioUpdateSchema = clienteDatosSchema.pick({ nombre: true, telefono: true, dni: true }).partial();

export const clienteQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export type ClienteCreate = z.infer<typeof clienteCreateSchema>;
export type ClienteUpdate = z.infer<typeof clienteUpdateSchema>;
