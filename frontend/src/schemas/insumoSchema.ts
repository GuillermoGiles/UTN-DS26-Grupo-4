import { z } from 'zod';

const numero = (mensaje: string) =>
  z.string().trim().refine((v) => v !== '' && !Number.isNaN(Number(v.replace(',', '.'))), mensaje).transform((v) => Number(v.replace(',', '.')));

export const insumoSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio'),
  unidad: z.enum(['litros', 'unidades']),
  stock: numero('Ingresá el stock inicial').refine((n) => n >= 0, 'No puede ser negativo'),
  stockMinimo: numero('Ingresá el stock mínimo').refine((n) => n >= 0, 'No puede ser negativo'),
});

export const movimientoSchema = z.object({
  tipo: z.enum(['carga', 'ajuste']),
  cantidad: numero('Ingresá la cantidad').refine((n) => n > 0, 'Tiene que ser mayor a 0'),
  motivo: z.string().trim().min(3, 'Indicá el motivo'),
});
