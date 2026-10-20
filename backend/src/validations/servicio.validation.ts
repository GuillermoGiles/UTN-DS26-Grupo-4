import { z } from "zod";

export const servicioCreateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  precio: z.number().positive("El precio debe ser mayor a 0"),
  desc: z.string().trim().min(1, "La descripcion es obligatoria"),
  tipo: z.enum(["lavadero", "lubricentro"], { message: "El tipo debe ser lavadero o lubricentro" })
});

export const servicioUpdateSchema = servicioCreateSchema.partial();

export { idParamSchema } from "./common.validation";

export type ServicioCreate = z.infer<typeof servicioCreateSchema>;
export type ServicioUpdate = z.infer<typeof servicioUpdateSchema>;
