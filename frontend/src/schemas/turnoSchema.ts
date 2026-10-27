import { z } from 'zod';
import { idOpcional, textoOpcional } from './campos';

export const turnoSchema = z.object({
  fecha: z.string().min(1, 'Elegí una fecha'),
  hora: z.string().min(1, 'Elegí un horario libre'),
  // Uno o más servicios (los botones guardan los ids como texto). "Como máximo un lavado"
  // lo resuelve la pantalla al elegir y la API lo vuelve a validar.
  servicioIds: z.array(z.string()).min(1, 'Elegí al menos un servicio').transform((ids) => ids.map(Number)),
  vehiculoId: idOpcional,
  clienteId: idOpcional,
  nota: textoOpcional(300),
});

export type TurnoForm = z.input<typeof turnoSchema>;
