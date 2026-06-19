import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ServicioDestacado } from '../components/ServicioDestacado';
import type { Servicio } from '../types/servicio';

type ServiciosProps = {
  servicios: Servicio[];
};

export function Servicios({ servicios }: ServiciosProps) {
  return (
    <Container className="mt-5 pt-4 mb-5">
      
      {/* Encabezado de la página */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2>Gestión de Servicios e Insumos</h2>
        <Link to="/servicios/nuevo" className="btn btn-success shadow-sm">
          + Nuevo Servicio
        </Link>
      </div>

      {/* Grilla de servicios */}
      <Row className="g-4 justify-content-center">
        {servicios.map((srv) => (
          <Col key={srv.id} xs={12} sm={6} lg={4} className="d-flex justify-content-center">
            <ServicioDestacado 
              nombre={srv.nombre} 
              precio={srv.precio} 
              descripcion={srv.desc}
              tipo={srv.tipo}
            />
          </Col>
        ))}
      </Row>
      
    </Container>
  );
}