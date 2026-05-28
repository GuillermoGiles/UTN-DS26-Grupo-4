import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';

export type ServicioDestacadoProps = {
  nombre: string;       
  precio: number;       
  descripcion?: string; 
  tipo?: 'lavadero' | 'lubricentro'; 
};

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
    <Card 
      className={`shadow-sm h-100 ${seleccionado ? 'border-primary bg-light' : ''}`}
      style={{ width: '18rem', margin: '1rem' }}
    >
      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className={`badge ${tipo === 'lubricentro' ? 'bg-danger' : 'bg-info text-dark'} text-uppercase`}>
              {tipo}
            </span>
          </div>
          <Card.Title className="fw-bold text-dark">{nombre}</Card.Title>
          <Card.Text className="text-muted small">{descripcion}</Card.Text>
        </div>
        <div className="mt-3">
          <div className="fs-4 fw-bold text-primary mb-3">
            ${precio.toLocaleString('es-AR')}
          </div>
          <Button 
            variant={seleccionado ? "success" : "outline-primary"} 
            className="w-100" 
            onClick={handleSeleccion}
          >
            {seleccionado ? "✓ Seleccionado" : "Reservar Turno"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};