import { ResumenCaja } from '../components/ResumenCaja';
import TurnoCard from '../components/TurnoCard';
import { Container, Row, Col } from 'react-bootstrap';
import { FiActivity, FiUsers } from 'react-icons/fi';

export function Home() {
  return (
    <>
      <Container id="turnos" className="py-5">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FiActivity size={24} className="text-primary" />
          <h2 className="mb-0">Panel de Control Operativo</h2> 
        </div>
        
        <Row className="g-4">
          <Col xs={12} md={6} lg={4}>
            <ResumenCaja ingresos={185000} vehiculos={12} />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <TurnoCard patente="AB 123 CD" servicio="Cambio de Aceite" />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <TurnoCard patente="XYZ 987" servicio="Lavado Completo Premium" />
          </Col>
        </Row>
      </Container>

      <div className="bg-white border-top py-5">
        <Container id="clientes" className="text-center">
          <FiUsers size={48} className="text-muted mb-3 opacity-50" />
          <h2>Módulo de Clientes y Vehículos</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Acceda al listado completo de clientes, administre sus datos personales y 
            lleve un registro detallado del historial de mantenimiento de cada vehículo.
          </p>
          <button className="btn-outline-custom mt-3">Ver Directorio</button>
        </Container>
      </div>
    </>
  );
}
