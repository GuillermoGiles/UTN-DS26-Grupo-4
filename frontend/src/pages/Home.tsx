import { Container, Row, Col } from 'react-bootstrap';
import { FiActivity, FiUsers, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { ResumenCaja } from '../components/ResumenCaja';
import DefaultTurnoCard from '../components/TurnoCard'; // Ajustado según tu export default anterior

export function Home() {
  return (
    <>
      {/* Panel de Control Operativo */}
      <Container id="turnos" className="py-5 text-start">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FiActivity size={24} className="text-primary" />
          <h2 className="mb-0 fw-bold">Panel de Control Operativo</h2> 
        </div>
        
        <Row className="g-4">
          <Col xs={12} md={6} lg={4}>
            <ResumenCaja ingresos={185000} vehiculos={12} />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <DefaultTurnoCard patente="AB 123 CD" servicio="Cambio de Aceite" />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <DefaultTurnoCard patente="XYZ 987" servicio="Lavado Completo Premium" />
          </Col>
        </Row>
      </Container>

      {/* Módulo de Clientes y Vehículos */}
      <div className="bg-white border-top py-5">
        <Container id="clientes" className="text-center py-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-light p-3 rounded-circle mb-3">
            <FiUsers size={40} className="text-primary" />
          </div>
          <h2 className="fw-bold mb-3 text-dark">Módulo de Clientes y Vehículos</h2>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: '600px' }}>
            Accedé al directorio completo de clientes registrados, gestioná sus vehículos vinculados e inspeccioná el historial operativo de cada uno.
          </p>
          
          {/* Solución al estilo visual y al error de compilación */}
          <div className="d-flex justify-content-center">
            <Link 
              to="/clientes" 
              className="btn-outline-custom d-inline-flex align-items-center gap-2 text-decoration-none"
            >
              Ver directorio <FiArrowRight size={16} />
            </Link>
          </div>
        </Container>
      </div>
    </>
  );
}