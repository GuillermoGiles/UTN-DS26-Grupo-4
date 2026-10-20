import { z } from 'zod';
import { idRequerido, textoOpcional } from './campos';

export const lavadoSchema = z.object({
  vehiculoId: idRequerido('Elegí el vehículo que ingresa'),
  servicioId: idRequerido('Elegí el tipo de lavado'),
  observaciones: textoOpcional(300),
});

export type LavadoForm = z.input<typeof lavadoSchema>;
