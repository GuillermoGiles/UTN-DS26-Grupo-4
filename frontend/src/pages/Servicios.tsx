import { Container, Row, Col } from 'react-bootstrap';
import { ServicioDestacado } from '../components/ServicioDestacado';
import { FiTool, FiPlus } from 'react-icons/fi';

// Array de datos simulados para maquetar el catálogo
const SERVICIOS_MOCK = [
  { id: 1, nombre: "Cambio de Aceite", precio: 45000, desc: "Servicio técnico completo con reemplazo de filtros esenciales.", tipo: "lubricentro" },
  { id: 2, nombre: "Lavado Premium", precio: 12000, desc: "Limpieza artesanal profunda exterior e interior.", tipo: "lavadero" },
  { id: 3, nombre: "Alineación y Balanceo", precio: 25000, desc: "Ajuste de tren delantero y balanceo computarizado.", tipo: "lubricentro" },
  { id: 4, nombre: "Limpieza Tapizados", precio: 35000, desc: "Lavado en seco de butacas y alfombras con máquinas de inyección.", tipo: "lavadero" }
];

export function Servicios() {
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
            <button className="btn-primary-custom d-flex align-items-center gap-2">
              <FiPlus /> Nuevo Servicio
            </button>
        </div>
      </div>
      
      <Row className="g-4 justify-content-center">
        {SERVICIOS_MOCK.map((srv) => (
          <Col key={srv.id} xs={12} sm={6} lg={4} className="d-flex justify-content-center">
            <ServicioDestacado 
              nombre={srv.nombre} 
              precio={srv.precio} 
              descripcion={srv.desc}
              tipo={srv.tipo as 'lavadero' | 'lubricentro'}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}