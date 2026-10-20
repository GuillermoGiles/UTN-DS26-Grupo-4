import { z } from 'zod';
import { idOpcional, idRequerido, textoOpcional } from './campos';

export const turnoSchema = z.object({
  fecha: z.string().min(1, 'Elegí una fecha'),
  hora: z.string().min(1, 'Elegí un horario libre'),
  servicioId: idRequerido('Elegí el servicio'),
  vehiculoId: idOpcional,
  clienteId: idOpcional,
  nota: textoOpcional(300),
});

export type TurnoForm = z.input<typeof turnoSchema>;
