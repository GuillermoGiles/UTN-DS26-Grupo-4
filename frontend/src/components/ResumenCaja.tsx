import { useState } from 'react';
import { Badge } from 'react-bootstrap';
import { FiTrendingUp, FiInfo, FiChevronDown, FiChevronUp } from 'react-icons/fi';

type ResumenCajaProps = {
  ingresos: number;
  vehiculos: number;
};

export function ResumenCaja({ ingresos, vehiculos }: ResumenCajaProps) {
  const [verDetalle, setVerDetalle] = useState<boolean>(false);
  const ticketPromedio = vehiculos > 0 ? (ingresos / vehiculos) : 0;

  return (
    <div className="saas-card mb-4 h-100">
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2 text-muted fw-bold small">
            <FiTrendingUp className="text-primary" size={18} /> INGRESOS DEL DÍA
          </div>
          <Badge bg="primary" pill className="px-3 py-2 fw-normal">
            {vehiculos} vehículos
          </Badge>
        </div>

        <div className="mb-4">
          <h2 className="display-5 fw-bold mb-0 text-dark">
            ${ingresos.toLocaleString('es-AR')}
          </h2>
        </div>
        
        {verDetalle && (
          <div className="bg-light p-3 rounded-3 mb-4 d-flex gap-3 align-items-start border">
            <FiInfo className="text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="mb-0 small text-muted">
                <strong>Análisis:</strong> El ticket promedio por vehículo en la jornada de hoy es de <strong className="text-dark">${ticketPromedio.toLocaleString('es-AR')}</strong>.
              </p>
            </div>
          </div>
        )}
        
        <button 
          className="btn-outline-custom w-100 d-flex justify-content-center align-items-center gap-2"
          onClick={() => setVerDetalle(!verDetalle)}
        >
          {verDetalle ? <><FiChevronUp /> Ocultar métricas</> : <><FiChevronDown /> Ver análisis</>}
        </button>
      </div>
    </div>
  );
}