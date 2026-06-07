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
          <Card className="shadow-sm border-primary border-top border-3">
            <Card.Body>
              <Card.Title className="text-muted fs-6">Vehículos Hoy</Card.Title>
              <h3 className="fw-bold">{vehiculosLavados}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-success border-top border-3">
            <Card.Body>
              <Card.Title className="text-muted fs-6">Ingresos del Día</Card.Title>
              <h3 className="fw-bold">${ingresosDiarios.toLocaleString('es-AR')}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-warning border-top border-3">
            <Card.Body>
              <Card.Title className="text-muted fs-6">Turnos Pendientes</Card.Title>
              <h3 className="fw-bold">{turnosPendientes}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de últimos servicios */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white fw-bold py-3">
          Últimos Servicios Registrados
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
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
        </Card.Body>
      </Card>
    </Container>
  );
}