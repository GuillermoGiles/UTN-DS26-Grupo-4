import { useState } from 'react';
import { Badge } from 'react-bootstrap';
import { FiClock, FiPlayCircle, FiRotateCcw } from 'react-icons/fi';

type TurnoCardProps = {
  patente: string;
  servicio: string;
};

export default function TurnoCard({ patente, servicio }: TurnoCardProps) {
  const [enProceso, setEnProceso] = useState<boolean>(false);

  return (
    <div className="saas-card h-100 d-flex flex-column" style={{ position: 'relative' }}>
      <div 
        style={{ 
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', 
          backgroundColor: enProceso ? 'var(--success-color)' : 'var(--secondary-color)',
          borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px'
        }} 
      />
      
      <div className="p-4 d-flex flex-column h-100 ms-2">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="text-muted small fw-bold mb-1">PATENTE</div>
            <h4 className="mb-0 fw-bold">{patente}</h4>
          </div>
          <Badge bg={enProceso ? "success" : "light"} text={enProceso ? "white" : "dark"} className="border">
            {enProceso ? "En Proceso" : "Pendiente"}
          </Badge>
        </div>

        <div className="mb-4 flex-grow-1">
          <div className="d-flex align-items-center gap-2 text-muted">
            <FiClock /> <span>{servicio}</span>
          </div>
        </div>

        <button
          onClick={() => setEnProceso(!enProceso)}
          className={`w-100 ${enProceso ? "btn-outline-custom" : "btn-primary-custom"} d-flex justify-content-center align-items-center gap-2`}
        >
          {enProceso ? <><FiRotateCcw /> Revertir a Pendiente</> : <><FiPlayCircle /> Iniciar Servicio</>}
        </button>
      </div>
    </div>
  );
}