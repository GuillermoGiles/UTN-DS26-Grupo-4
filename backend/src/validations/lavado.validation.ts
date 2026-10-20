import { z } from "zod";
import { fechaSchema } from "./common.validation";
export { idParamSchema } from "./common.validation";

export const lavadoCreateSchema = z.object({
  vehiculoId: z.number().int().positive("Elegí el vehículo"),
  servicioId: z.number().int().positive("Elegí el tipo de lavado"),
  observaciones: z.string().trim().max(300, "Máximo 300 caracteres").optional(),
});

export const lavadoUpdateSchema = lavadoCreateSchema.partial();

export const lavadoQuerySchema = z.object({
  fecha: fechaSchema.optional(),
});

export type LavadoCreate = z.infer<typeof lavadoCreateSchema>;
export type LavadoUpdate = z.infer<typeof lavadoUpdateSchema>;
