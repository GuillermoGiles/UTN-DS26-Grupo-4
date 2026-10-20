import { z } from "zod";
export { idParamSchema } from "./common.validation";

const cantidad = z.number().min(0, "No puede ser negativo");

export const insumoCreateSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(100),
  unidad: z.enum(["litros", "unidades"], { message: "La unidad debe ser litros o unidades" }),
  stock: cantidad,
  stockMinimo: cantidad,
});

// El stock no se edita directo: se carga o ajusta con un movimiento (queda el historial)
export const insumoUpdateSchema = insumoCreateSchema.omit({ stock: true }).partial();

export const movimientoSchema = z.object({
  cantidad: z.number().refine((n) => n !== 0, "La cantidad no puede ser 0"),
  motivo: z.string().trim().min(3, "Indicá el motivo (ej. compra al proveedor)").max(120),
});

export const recetaSchema = z.object({
  insumos: z
    .array(z.object({ insumoId: z.number().int().positive(), cantidad: z.number().positive("La cantidad tiene que ser mayor a 0") }))
    .refine((items) => new Set(items.map((i) => i.insumoId)).size === items.length, "Un insumo no puede repetirse"),
});

export type InsumoCreate = z.infer<typeof insumoCreateSchema>;
export type InsumoUpdate = z.infer<typeof insumoUpdateSchema>;
