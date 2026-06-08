import { Container, Row, Col, Button } from 'react-bootstrap';
import { ServicioDestacado } from '../components/ServicioDestacado';

// Array de datos simulados para maquetar el catálogo
const SERVICIOS_MOCK = [
  { id: 1, nombre: "Cambio de Aceite", precio: 45000, desc: "Servicio técnico completo con reemplazo de filtros esenciales.", tipo: "lubricentro" },
  { id: 2, nombre: "Lavado Premium", precio: 12000, desc: "Limpieza artesanal profunda exterior e interior.", tipo: "lavadero" },
  { id: 3, nombre: "Alineación y Balanceo", precio: 25000, desc: "Ajuste de tren delantero y balanceo computarizado.", tipo: "lubricentro" },
  { id: 4, nombre: "Limpieza Tapizados", precio: 35000, desc: "Lavado en seco de butacas y alfombras con máquinas de inyección.", tipo: "lavadero" }
];

export function Servicios() {
  return (
    <Container className="mt-5 pt-4 mb-5">
      
      {/* Encabezado de la página */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2>Gestión de Servicios e Insumos</h2>
        <Button variant="success" className="shadow-sm">+ Nuevo Servicio</Button>
      </div>

      {/* Grilla de servicios */}
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