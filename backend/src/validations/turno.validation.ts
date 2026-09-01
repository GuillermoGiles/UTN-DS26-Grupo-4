import { z } from "zod";

export const turnoCreateSchema = z.object({
  fecha: z.string().trim().min(1, "La fecha es obligatoria"),
  hora: z.string().trim().min(1, "La hora es obligatoria"),
  clienteId: z.number().int().positive("El ID de cliente debe ser un entero positivo"),
  servicioId: z.number().int().positive("El ID de servicio debe ser un entero positivo"),
});

export const turnoUpdateSchema = turnoCreateSchema.partial();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
});

export type TurnoCreate = z.infer<typeof turnoCreateSchema>;
export type TurnoUpdate = z.infer<typeof turnoUpdateSchema>;
