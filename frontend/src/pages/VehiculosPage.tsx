import { Container, Table } from 'react-bootstrap';
import { FiPlus, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // 1. Importar el hook

export function VehiculosPage() {
  const navigate = useNavigate(); // 2. Inicializar el navegador

  return (
    <Container className="py-5 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Vehículos Registrados</h2>
          <p className="text-muted mb-0">Listado completo de vehículos y sus clientes titulares.</p>
        </div>
        {/* 3. Agregar el evento onClick para redirigir al formulario */}
        <button 
          className="btn-primary-custom d-flex align-items-center gap-2"
          onClick={() => navigate('/vehiculos/nuevo')}
        >
          <FiPlus /> Nuevo Vehículo
        </button>
      </div>
      
      <div className="saas-card">
        <Table responsive className="table-saas mb-0">
          <thead>
            <tr>
              <th>Patente</th>
              <th>Nombre Modelo</th>
              <th>Cliente Titular</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fw-bold text-primary">AB 123 CD</td>
              <td>Toyota Hilux 2.8 TDI</td>
              <td>Juan Pérez</td>
              <td className="text-end">
                <button className="btn-outline-custom btn-sm d-inline-flex align-items-center gap-1">
                  <FiClock size={14} /> Historial
                </button>
              </td>
            </tr>
            <tr>
              <td className="fw-bold text-primary">XYZ 987</td>
              <td>Ford Fiesta Kinetic</td>
              <td>María Gómez</td>
              <td className="text-end">
                <button className="btn-outline-custom btn-sm d-inline-flex align-items-center gap-1">
                  <FiClock size={14} /> Historial
                </button>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Container>
  );
}