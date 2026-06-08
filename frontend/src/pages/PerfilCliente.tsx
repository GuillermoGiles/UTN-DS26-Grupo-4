import { Container, Row, Col, Card, ListGroup, Table, Badge, Button } from 'react-bootstrap';

export function PerfilCliente() {
  // Datos simulados de un cliente del establecimiento San José para la maquetación
  const cliente = {
    nombre: "Juan Pérez",
    email: "juan.perez@example.com",
    telefono: "221-555-1234",
    fechaRegistro: "15/03/2025",
    vehiculos: [
      { patente: "AB 123 CD", modelo: "Toyota Hilux 2.8 TDI", año: 2021 },
      { patente: "XYZ 987", modelo: "Ford Fiesta Kinetic", año: 2018 }
    ],
    historial: [
      { fecha: "07/06/2026", patente: "AB 123 CD", servicio: "Cambio de Aceite", estado: "Finalizado", costo: 45000 },
      { fecha: "28/05/2026", patente: "XYZ 987", servicio: "Lavado Completo Premium", estado: "Finalizado", costo: 12000 }
    ]
  };

  return (
    <Container className="py-5 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2 className="fw-bold text-dark m-0">Ficha del Cliente</h2>
        <Button variant="outline-primary" size="sm">Editar Datos</Button>
      </div>

      <Row className="g-4">
        {/* Columna Izquierda: Información Personal y Vehículos */}
        <Col lg={4}>
          {/* Tarjeta de Datos Personales */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-dark text-white fw-bold">
              👤 Datos Personales
            </Card.Header>
            <Card.Body>
              <Card.Title className="mb-3 text-primary fw-bold">{cliente.nombre}</Card.Title>
              <ListGroup variant="flush" className="small">
                <ListGroup.Item><strong>Email:</strong> {cliente.email}</ListGroup.Item>
                <ListGroup.Item><strong>Teléfono:</strong> {cliente.telefono}</ListGroup.Item>
                <ListGroup.Item><strong>Alta en Sistema:</strong> {cliente.fechaRegistro}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Tarjeta de Vehículos Asociados */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-dark text-white fw-bold">
              🚘 Vehículos Vinculados
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {cliente.vehiculos.map((v, idx) => (
                  <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center py-3">
                    <div>
                      <span className="badge bg-secondary text-uppercase me-2 font-monospace">{v.patente}</span>
                      <span className="small fw-semibold">{v.modelo}</span>
                    </div>
                    <Badge bg="light" text="dark" className="border">{v.año}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Derecha: Historial de Trabajos */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-dark text-white fw-bold py-3">
              📋 Historial de Servicios Realizados
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Vehículo</th>
                    <th>Servicio Detallado</th>
                    <th>Estado</th>
                    <th>Total Cobrado</th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.historial.map((h, idx) => (
                    <tr key={idx}>
                      <td className="text-muted small">{h.fecha}</td>
                      <td className="fw-bold font-monospace text-uppercase">{h.patente}</td>
                      <td>{h.servicio}</td>
                      <td><Badge bg="success">{h.estado}</Badge></td>
                      <td className="text-success fw-bold">${h.costo.toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}