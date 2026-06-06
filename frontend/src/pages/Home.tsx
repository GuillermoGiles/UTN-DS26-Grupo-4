// Página de inicio. Acá moví los componentes de mis compañeros (Caja y Turnos) que antes estaban sueltos en App.tsx.
import { Container, Row, Col } from 'react-bootstrap';
import { ResumenCaja } from '../components/ResumenCaja';
import TurnoCard from '../components/TurnoCard';

export function Home() {
  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center fw-bold text-primary">Panel de Control - San Jose</h1> 
      <Row className="g-4">
        {/* Componente de Caja */}
        <Col xs={12} md={6} lg={4}>
          <ResumenCaja ingresos={185000} vehiculos={12} />
        </Col>
        
        {/* Componentes de Turnos integrados */}
        <Col xs={12} md={6} lg={4}>
          <TurnoCard patente="AB 123 CD" servicio="Cambio de Aceite" />
        </Col>
        <Col xs={12} md={6} lg={4}>
          <TurnoCard patente="XYZ 987" servicio="Lavado Completo Premium" />
        </Col>
      </Row>
    </Container>
  );
}
