import { z } from 'zod';
import { normalizarPatente } from '../utils/formato';

// Piezas reutilizables para los formularios. Los <select> y los <input type="number">
// entregan texto: estos campos lo validan como texto y lo transforman al número que espera la API.

/** <select> obligatorio con ids: "" → error, "4" → 4 */
export const idRequerido = (mensaje: string) =>
  z.string().min(1, mensaje).transform(Number);

/** <select> opcional con ids: "" → undefined */
export const idOpcional = z
  .string()
  .transform((v) => (v ? Number(v) : undefined));

/** <input> numérico opcional: "" → undefined; tiene que ser entero entre min y max */
export const enteroOpcional = (min: number, max: number, mensaje: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) >= min && Number(v) <= max), mensaje)
    .transform((v) => (v === '' ? undefined : Number(v)));

/** Misma regla que el backend: AAA123 o AA123BB, admite espacios y guiones al escribir */
export const patente = z
  .string()
  .trim()
  .min(1, 'La patente es obligatoria')
  .transform(normalizarPatente)
  .refine((p) => /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/.test(p), 'Formato válido: AAA123 o AA123BB');

export const telefono = z.string().trim().min(6, 'El teléfono debe tener al menos 6 caracteres').max(20, 'Teléfono demasiado largo');

export const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .transform((v) => (v === '' ? undefined : v));
