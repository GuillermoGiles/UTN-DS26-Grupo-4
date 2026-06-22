import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ServicioDestacado } from '../components/ServicioDestacado';
import { FiTool, FiPlus } from 'react-icons/fi';
import type { Servicio } from '../types/servicio';

type ServiciosProps = {
  servicios: Servicio[];
};

export function Servicios({ servicios }: ServiciosProps) {
  return (
    <Container id="stock" className="py-5">
      <div className="d-flex flex-column align-items-center mb-5">
        <div className="d-inline-block bg-white p-3 rounded-circle shadow-sm mb-3">
          <FiTool size={32} className="text-primary" />
        </div>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100 gap-3">
            <div>
                <h2 className="mb-2 text-center text-md-start">Catálogo de Servicios</h2>
                <p className="text-muted text-center text-md-start mb-0">Explore nuestros servicios especializados de lavadero y lubricentro.</p>
            </div>
            <Link to="/servicios/nuevo" className="btn-primary-custom d-flex align-items-center gap-2 text-decoration-none">
              <FiPlus /> Nuevo Servicio
            </Link>
        </div>
      </div>
      
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