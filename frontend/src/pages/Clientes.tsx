import { Container, Table, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import type { Cliente } from '../schemas/clienteSchema';

export function Clientes() {
  const navigate = useNavigate();
  // Conectado al endpoint real del backend (requiere auth ADMIN o EMPLEADO)
  // apiFetch inyecta automáticamente el Bearer token desde localStorage
  const { data: clientes, loading, error } = useFetch<Cliente[]>('/api/clientes');

  return (
    <Container className="mt-4 pt-4 mb-5">
      <h1 className="mb-4 fw-bold">Clientes y Vehículos</h1>
      <div className="saas-card-dark p-0">
        <div className="p-4 border-bottom border-secondary d-flex justify-content-between align-items-center">
          <h5 className="m-0 fw-bold text-white">Directorio de Clientes</h5>
          <button className="btn-primary-custom" onClick={() => navigate('/clientes/nuevo')}>Nuevo Cliente</button>
        </div>

        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {error && (
          <Alert variant="danger" className="text-center my-5 mx-4">
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Table responsive hover variant="dark" className="align-middle mb-0">
            <thead>
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
              {(clientes ?? []).map(cliente => (
                <tr key={cliente.id}>
                  <td className="text-muted">{cliente.id}</td>
                  <td className="fw-bold text-white">{cliente.nombre}</td>
                  <td>{cliente.vehiculo}</td>
                  <td><span className="badge bg-secondary">{cliente.patente}</span></td>
                  <td>{cliente.telefono}</td>
                  <td>
                    <button className="btn-action-dark me-2">Ver</button>
                    <button className="btn-action-dark">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
}