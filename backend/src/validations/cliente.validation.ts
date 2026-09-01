import { z } from "zod";

export const clienteCreateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  vehiculo: z.string().trim().min(1, "El vehiculo es obligatorio"),
  patente: z.string().trim().toUpperCase().min(6, "La patente debe tener al menos 6 caracteres").max(10),
  telefono: z.string().trim().min(1, "El telefono es obligatorio").max(20)
});

export const clienteUpdateSchema = clienteCreateSchema.partial();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("El id debe ser un número positivo"),
});
