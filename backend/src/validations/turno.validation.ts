import { z } from "zod";
import { HORARIOS } from "../config/negocio";
import { fechaSchema } from "./common.validation";
export { idParamSchema } from "./common.validation";

export const ESTADOS_TURNO = ["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "COMPLETADO", "CANCELADO"] as const;

const horaSchema = z
  .string()
  .trim()
  .min(1, "La hora es obligatoria")
  .refine((h) => HORARIOS.includes(h), "Elegí un horario de atención (cada 30 minutos, de 08:00 a 17:30)");

export const turnoCreateSchema = z.object({
  fecha: fechaSchema,
  hora: horaSchema,
  // Lo exige el service para EMPLEADO/ADMIN. Un CLIENTE siempre reserva para su propia ficha.
  clienteId: z.number().int().positive("El ID de cliente debe ser un entero positivo").optional(),
  vehiculoId: z.number().int().positive("El ID de vehículo debe ser un entero positivo").optional(),
  // Uno o más servicios. "Como máximo un lavado" necesita el tipo de cada servicio: lo valida el service.
  servicioIds: z
    .array(z.number().int().positive("El ID de servicio debe ser un entero positivo"))
    .min(1, "Elegí al menos un servicio")
    .max(10, "Demasiados servicios para un turno")
    .refine((ids) => new Set(ids).size === ids.length, "Hay servicios repetidos"),
  nota: z.string().trim().max(300, "La nota no puede superar los 300 caracteres").optional(),
});

export const turnoUpdateSchema = turnoCreateSchema.extend({
  estado: z.enum(ESTADOS_TURNO).optional(),
}).partial();

export const turnoEstadoSchema = z.object({
  estado: z.enum(ESTADOS_TURNO, { message: "Estado inválido" }),
});

export const turnoQuerySchema = z.object({
  fecha: fechaSchema.optional(),
  estado: z.enum(ESTADOS_TURNO).optional(),
});

export const disponiblesQuerySchema = z.object({
  fecha: fechaSchema,
});

export type TurnoCreate = z.infer<typeof turnoCreateSchema>;
export type TurnoUpdate = z.infer<typeof turnoUpdateSchema>;
export type EstadoTurnoInput = (typeof ESTADOS_TURNO)[number];
