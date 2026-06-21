import { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

// Tipamos las props que va a recibir la tarjeta
type ResumenCajaProps = {
  ingresos: number;
  vehiculos: number;
};

export function ResumenCaja({ ingresos, vehiculos }: ResumenCajaProps) {
  // Estado para mostrar u ocultar el análisis extra
  const [verDetalle, setVerDetalle] = useState<boolean>(false);

  // Calculamos el ticket promedio asegurándonos de no dividir por cero
  const ticketPromedio = vehiculos > 0 ? (ingresos / vehiculos) : 0;

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-dark text-white fw-bold">
        Tablero de Control - Caja
      </Card.Header>
      <Card.Body>
        <Card.Title>
          Ingresos del Día: <span className="text-success">${ingresos.toLocaleString('es-AR')}</span>
        </Card.Title>
        <Card.Text className="text-muted mt-3">
          Vehículos atendidos: <Badge bg="primary" className="ms-1">{vehiculos}</Badge>
        </Card.Text>
        
        {/* Sección condicional que se muestra solo si verDetalle es true */}
        {verDetalle && (
          <div className="alert alert-info mt-3 small">
            <strong>Análisis:</strong> El ticket promedio por vehículo en la jornada de hoy es de ${ticketPromedio.toLocaleString('es-AR')}.
          </div>
        )}
        
        <Button 
          variant="outline-dark" 
          size="sm" 
          className="mt-2"
          onClick={() => setVerDetalle(!verDetalle)}
        >
          {verDetalle ? 'Ocultar métricas' : 'Ver análisis de métricas'}
        </Button>
      </Card.Body>
    </Card>
  );
}