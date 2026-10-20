import { z } from "zod";
import { normalizarPatente, PATENTE_REGEX } from "../utils/patente";
export { idParamSchema } from "./common.validation";

const anioMaximo = new Date().getFullYear() + 1;

// "ab 123-cd" → "AB123CD", y después se valida el formato argentino
export const patenteSchema = z
  .string()
  .trim()
  .min(6, "La patente debe tener al menos 6 caracteres")
  .max(10, "La patente es demasiado larga")
  .transform(normalizarPatente)
  .refine((p) => PATENTE_REGEX.test(p), "La patente debe ser AAA123 o AA123BB");

// Sin .default(): si no, un PUT parcial pisaría km con 0
export const vehiculoDatosSchema = z.object({
  patente: patenteSchema,
  marca: z.string().trim().min(1, "La marca es obligatoria").max(50),
  modelo: z.string().trim().min(1, "El modelo es obligatorio").max(80),
  anio: z.number().int().min(1950, "Año inválido").max(anioMaximo, "Año inválido").optional(),
  km: z.number().int().min(0, "Los km no pueden ser negativos").optional(),
});

// clienteId lo exige el service para EMPLEADO/ADMIN; un CLIENTE siempre carga a su nombre
export const vehiculoCreateSchema = vehiculoDatosSchema.extend({
  clienteId: z.number().int().positive("El ID de cliente debe ser un entero positivo").optional(),
});

export const vehiculoUpdateSchema = vehiculoCreateSchema.partial();

export const registrarServiceSchema = z.object({
  km: z.number().int().min(0, "Los km no pueden ser negativos"),
});

export const vehiculoQuerySchema = z.object({
  q: z.string().trim().max(50).optional(),
});

export type VehiculoCreate = z.infer<typeof vehiculoCreateSchema>;
export type VehiculoUpdate = z.infer<typeof vehiculoUpdateSchema>;
