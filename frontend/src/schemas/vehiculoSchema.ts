import { z } from 'zod';
import { idOpcional } from './campos';
import { vehiculoCamposSchema } from './clienteSchema';

// clienteId lo elige el personal; un cliente que carga su auto no lo manda
export const vehiculoSchema = vehiculoCamposSchema.extend({ clienteId: idOpcional });

export type VehiculoForm = z.input<typeof vehiculoSchema>;

export const registrarServiceSchema = z.object({
  km: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Ingresá los km actuales (solo números)')
    .transform(Number),
});
