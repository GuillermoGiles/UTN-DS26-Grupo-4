import type { ReactNode } from 'react';
import { Badge } from 'react-bootstrap';
import type { TipoServicio } from '../types/servicio';
import { pesos } from '../utils/formato';

export interface ServicioDestacadoProps {
  nombre: string;
  precio: number;
  descripcion: string;
  tipo: TipoServicio;
  /** Botón principal (ej. "Reservar turno") */
  accion?: ReactNode;
  /** Botones de gestión, solo los recibe un ADMIN */
  acciones?: ReactNode;
}

export function ServicioDestacado({ nombre, precio, descripcion, tipo, accion, acciones }: ServicioDestacadoProps) {
  return (
    <div className="saas-card-dark h-100 d-flex flex-column w-100">
      <div className="p-4 d-flex flex-column h-100">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Badge bg={tipo === 'lubricentro' ? 'danger' : 'info'} text={tipo === 'lubricentro' ? undefined : 'dark'} pill>
            {tipo === 'lubricentro' ? 'Lubricentro' : 'Lavadero'}
          </Badge>
          {acciones && <div className="d-flex gap-2">{acciones}</div>}
        </div>
        <h4 className="fw-bold mb-2">{nombre}</h4>
        <p className="text-muted small lh-lg">{descripcion}</p>
        <div className="mt-auto pt-3 border-top border-secondary d-flex justify-content-between align-items-center gap-2">
          <span className="fs-3 fw-bold">{pesos(precio)}</span>
          {accion}
        </div>
      </div>
    </div>
  );
}
