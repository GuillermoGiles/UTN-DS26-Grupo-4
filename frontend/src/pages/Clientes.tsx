import { Container, Card, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Cliente } from '../schemas/clienteSchema';

interface Props {
  clientes: Cliente[];
}

export function Clientes({ clientes }: Props) {
  const navigate = useNavigate();

  return (
    <Container className="mt-4 pt-4 mb-5">
      <h1 className="mb-4">Clientes y Vehículos</h1>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="m-0">Directorio de Clientes</Card.Title>
            <Button variant="primary" onClick={() => navigate('/clientes/nuevo')}>Nuevo Cliente</Button>
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
              {clientes.map(cliente => (
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
