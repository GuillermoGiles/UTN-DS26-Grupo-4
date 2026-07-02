import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';

export function PanelGestion() {
  // Datos simulados para maquetar la vista
  const vehiculosLavados = 14;
  const ingresosDiarios = 125000;
  const turnosPendientes = 5;

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold">Panel de Control Operativo</h2>
      
      {/* Tarjetas de KPIs (Indicadores clave) */}
      <Row className="mb-4 g-4">
        <Col md={4}>
          <div className="saas-card-dark p-4 h-100 d-flex flex-column justify-content-center align-items-start">
            <Badge bg="primary" pill className="mb-3 px-3 py-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Vehículos Hoy</Badge>
            <h3 className="fw-bold m-0 text-white">{vehiculosLavados}</h3>
          </div>
        </Col>
        <Col md={4}>
          <div className="saas-card-dark p-4 h-100 d-flex flex-column justify-content-center align-items-start">
            <Badge bg="success" pill className="mb-3 px-3 py-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Ingresos del Día</Badge>
            <h3 className="fw-bold m-0 text-white">${ingresosDiarios.toLocaleString('es-AR')}</h3>
          </div>
        </Col>
        <Col md={4}>
          <div className="saas-card-dark p-4 h-100 d-flex flex-column justify-content-center align-items-start">
            <Badge bg="warning" text="dark" pill className="mb-3 px-3 py-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Turnos Pendientes</Badge>
            <h3 className="fw-bold m-0 text-white">{turnosPendientes}</h3>
          </div>
        </Col>
      </Row>

      {/* Tabla de últimos servicios */}
      <div className="saas-card-dark">
        <div className="fw-bold p-3 border-bottom border-secondary text-white">
          Últimos Servicios Registrados
        </div>
        <div className="p-0">
          <Table responsive hover variant="dark" className="mb-0">
            <thead>
              <tr>
                <th>Patente</th>
                <th>Tipo de Lavado</th>
                <th>Empleado</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AC 123 BQ</td>
                <td>Lavado Premium</td>
                <td>Marcos Díaz</td>
                <td><Badge bg="success">Finalizado</Badge></td>
                <td>$12.000</td>
              </tr>
              <tr>
                <td>AB 456 CD</td>
                <td>Lavado Básico</td>
                <td>Juan Pérez</td>
                <td><Badge bg="warning" text="dark">En Proceso</Badge></td>
                <td>$8.500</td>
              </tr>
              <tr>
                <td>AE 789 FG</td>
                <td>Limpieza Tapizados</td>
                <td>Marcos Díaz</td>
                <td><Badge bg="secondary">Pendiente</Badge></td>
                <td>$25.000</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </Container>
  );
}