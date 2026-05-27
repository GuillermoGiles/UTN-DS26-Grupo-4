import { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

// Tipamos las props que va a recibir la tarjeta
type TurnoCardProps = {
  patente: string;
  servicio: string;
};

export default function TurnoCard({ patente, servicio }: TurnoCardProps) {
  // Estado local para manejar si el vehículo está en espera o ya entró al box
  const [enProceso, setEnProceso] = useState<boolean>(false);

  return (
    <Card className="mb-3 shadow-sm border-0" style={{ width: '18rem' }}>
      <Card.Header className="bg-dark text-white fw-bold">
        SGI San José - Turno
      </Card.Header>
      <Card.Body>
        <Card.Title>Patente: {patente}</Card.Title>
        <Card.Text>
          <strong>Servicio:</strong> {servicio}
        </Card.Text>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span>Estado actual:</span>
          <Badge bg={enProceso ? "success" : "secondary"}>
            {enProceso ? "En Proceso" : "Pendiente"}
          </Badge>
        </div>

        {/* Al hacer click, cambiamos el estado visual */}
        {/* Más adelante conectaremos esto a la BBDD para persistir los cambios */}
        <Button
          variant={enProceso ? "outline-success" : "primary"}
          onClick={() => setEnProceso(!enProceso)}
          className="w-100"
        >
          {enProceso ? "Revertir a Pendiente" : "Iniciar Servicio"}
        </Button>
      </Card.Body>
    </Card>
  );
}