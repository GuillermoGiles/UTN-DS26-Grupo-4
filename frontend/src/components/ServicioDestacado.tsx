import React, { useState } from 'react';
import { Badge } from 'react-bootstrap';
import { FiCheck, FiShoppingBag } from 'react-icons/fi';

export interface ServicioDestacadoProps {
  nombre: string;       
  precio: number;       
  descripcion?: string; 
  tipo?: 'lavadero' | 'lubricentro'; 
}

export const ServicioDestacado: React.FC<ServicioDestacadoProps> = ({
  nombre,
  precio,
  descripcion = "Servicio profesional garantizado por el establecimiento San José.",
  tipo = "lubricentro"
}) => {
  const [seleccionado, setSeleccionado] = useState<boolean>(false);

  const handleSeleccion = (): void => {
    setSeleccionado(!seleccionado);
  };

  return (
    <div 
      className={`saas-card-dark h-100 d-flex flex-column ${seleccionado ? 'border-primary' : ''}`}
      style={{ 
        width: '20rem', margin: '0.5rem',
        boxShadow: seleccionado ? '0 0 0 2px var(--primary-color), var(--shadow-md)' : 'var(--shadow-sm)'
      }}
    >
      <div className="p-4 d-flex flex-column h-100">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Badge 
              bg={tipo === 'lubricentro' ? 'danger' : 'info'} 
              className={tipo === 'lubricentro' ? '' : 'text-dark'}
              pill
            >
              {tipo.toUpperCase()}
            </Badge>
            {seleccionado && <FiCheck className="text-primary" size={24} />}
          </div>
          <h4 className="fw-bold text-dark mb-2">{nombre}</h4>
          <p className="text-muted small lh-lg">{descripcion}</p>
        </div>
        
        <div className="mt-auto pt-4 border-top">
          <div className="d-flex align-items-baseline mb-4">
            <span className="fs-2 fw-bold text-dark">${precio.toLocaleString('es-AR')}</span>
          </div>
          <button 
            className={`w-100 d-flex justify-content-center align-items-center gap-2 ${seleccionado ? "btn-primary-custom" : "btn-outline-custom"}`}
            onClick={handleSeleccion}
          >
            {seleccionado ? <><FiCheck /> Reservado</> : <><FiShoppingBag /> Reservar Turno</>}
          </button>
        </div>
      </div>
    </div>
  );
};