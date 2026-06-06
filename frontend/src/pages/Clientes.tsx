import { Container, Card, Table, Button } from 'react-bootstrap';

export function Clientes() {
  const clientesDummy = [
    { id: 1, nombre: 'Juan Pérez', vehiculo: 'Ford Fiesta', patente: 'AB 123 CD', telefono: '11-1234-5678' },
    { id: 2, nombre: 'María Gómez', vehiculo: 'Toyota Corolla', patente: 'XYZ 987', telefono: '11-9876-5432' },
    { id: 3, nombre: 'Carlos López', vehiculo: 'VW Gol', patente: 'EF 456 GH', telefono: '11-4567-8901' },
  ];

  return (
    <Container className="mt-4 pt-4 mb-5">
      <h1 className="mb-4">Clientes y Vehículos</h1>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="m-0">Directorio de Clientes</Card.Title>
            <Button variant="primary">Nuevo Cliente</Button>
          </div>
          <Table responsive hover className="align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Vehículo</th>
                <th>Patente</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesDummy.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td className="fw-bold">{cliente.nombre}</td>
                  <td>{cliente.vehiculo}</td>
                  <td><span className="badge bg-secondary">{cliente.patente}</span></td>
                  <td>{cliente.telefono}</td>
                  <td>
                    <Button variant="outline-info" size="sm" className="me-2">Ver</Button>
                    <Button variant="outline-primary" size="sm">Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}
