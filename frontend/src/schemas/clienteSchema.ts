import { z } from 'zod';
import { enteroOpcional, patente, telefono } from './campos';

const anioMax = new Date().getFullYear() + 1;

export const vehiculoCamposSchema = z.object({
  patente,
  marca: z.string().trim().min(1, 'La marca es obligatoria'),
  modelo: z.string().trim().min(1, 'El modelo es obligatorio'),
  anio: enteroOpcional(1950, anioMax, `Año entre 1950 y ${anioMax}`),
  km: enteroOpcional(0, 2_000_000, 'Kilometraje inválido'),
});

const emailOpcional = z
  .string()
  .trim()
  .refine((v) => v === '' || z.email().safeParse(v).success, 'Debe ser un email válido')
  .transform((v) => (v === '' ? undefined : v));

export const clienteDatosSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  telefono,
  email: emailOpcional,
});

/**
 * Alta de cliente: si se marca "Cargar su vehículo", los campos del auto pasan a ser
 * obligatorios y se mandan juntos (la API crea cliente y vehículo en una sola operación).
 */
export const clienteNuevoSchema = clienteDatosSchema
  .extend({
    conVehiculo: z.boolean(),
    patente: z.string(),
    marca: z.string(),
    modelo: z.string(),
    anio: z.string(),
    km: z.string(),
  })
  .transform((d, ctx) => {
    const cliente = { nombre: d.nombre, telefono: d.telefono, email: d.email };
    if (!d.conVehiculo) return cliente;
    const v = vehiculoCamposSchema.safeParse(d);
    if (!v.success) {
      for (const issue of v.error.issues) ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path });
      return z.NEVER;
    }
    return { ...cliente, vehiculo: v.data };
  });

export type ClienteNuevoForm = z.input<typeof clienteNuevoSchema>;
export type ClienteDatosForm = z.input<typeof clienteDatosSchema>;
