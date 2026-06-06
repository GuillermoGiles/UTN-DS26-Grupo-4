import { Container, Table, Button } from 'react-bootstrap';

export function VehiculosPage() {
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Vehículos</h2>
        <Button variant="primary">+ Nuevo Vehículo</Button>
      </div>
        // Maquetado de la página de Vehículos - Bautista Puertas
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Patente</th>
            <th>Nombre Modelo</th>
            <th>Cliente Titular</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="fw-bold">AB 123 CD</td>
            <td>Toyota Hilux 2.8 TDI</td>
            <td>Juan Pérez</td>
            <td>
              <Button variant="outline-secondary" size="sm">Ver Historial</Button>
            </td>
          </tr>
          <tr>
            <td className="fw-bold">XYZ 987</td>
            <td>Ford Fiesta Kinetic</td>
            <td>María Gómez</td>
            <td>
              <Button variant="outline-secondary" size="sm">Ver Historial</Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}
