import { z } from "zod";
import { vehiculoDatosSchema } from "./vehiculo.validation";
export { idParamSchema } from "./common.validation";

const clienteDatosSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  telefono: z.string().trim().min(6, "El teléfono debe tener al menos 6 caracteres").max(20),
  email: z.string().trim().toLowerCase().email("El formato de email no es válido").optional(),
});

// El alta puede traer el primer vehículo del cliente (se crean juntos, en una sola query)
export const clienteCreateSchema = clienteDatosSchema.extend({
  vehiculo: vehiculoDatosSchema.optional(),
});

export const clienteUpdateSchema = clienteDatosSchema.partial();

// Lo que un CLIENTE puede editar de su propia ficha (el email es el de su cuenta)
export const clienteMioUpdateSchema = clienteDatosSchema.pick({ nombre: true, telefono: true }).partial();

export const clienteQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export type ClienteCreate = z.infer<typeof clienteCreateSchema>;
export type ClienteUpdate = z.infer<typeof clienteUpdateSchema>;
