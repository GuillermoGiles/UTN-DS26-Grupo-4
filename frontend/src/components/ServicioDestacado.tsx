import type { ReactNode } from 'react';
import { FiDroplet, FiTool } from 'react-icons/fi';
import type { TipoServicio } from '../types/servicio';
import { pesos } from '../utils/formato';

export interface ServicioDestacadoProps {
  nombre: string;
  precio: number;
  descripcion: string;
  tipo: TipoServicio;
  /** Botón principal (ej. "Reservar") */
  accion?: ReactNode;
  /** Botones de gestión, solo los recibe un ADMIN */
  acciones?: ReactNode;
}

export function ServicioDestacado({ nombre, precio, descripcion, tipo, accion, acciones }: ServicioDestacadoProps) {
  const lubricentro = tipo === 'lubricentro';
  return (
    <article className="card-sgi h-100 w-100 d-flex flex-column">
      <div className="card-sgi-body d-flex flex-column h-100">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className={`icon-circle${lubricentro ? ' terracota' : ''}`}>{lubricentro ? <FiTool /> : <FiDroplet />}</span>
          {acciones ? <div className="d-flex gap-2">{acciones}</div> : <span className={`estado ${lubricentro ? 'estado-pendiente' : 'estado-confirmado'}`}>{lubricentro ? 'Lubricentro' : 'Lavadero'}</span>}
        </div>
        <span className="eyebrow" style={{ color: lubricentro ? 'var(--primary)' : 'var(--teal)' }}>{lubricentro ? 'LUBRICENTRO' : 'LAVADERO'}</span>
        <h3 className="fs-4 mb-2">{nombre}</h3>
        <p className="text-muted small mb-0">{descripcion}</p>
        <div className="mt-auto pt-3 d-flex justify-content-between align-items-end gap-2">
          <div>
            <small className="text-muted fw-bold d-block" style={{ fontSize: '.68rem', letterSpacing: '.06em' }}>PRECIO</small>
            <span className="display fs-3">{pesos(precio)}</span>
          </div>
          {accion}
        </div>
      </div>
    </article>
  );
}
