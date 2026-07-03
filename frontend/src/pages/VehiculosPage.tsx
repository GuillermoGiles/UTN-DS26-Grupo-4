import { Container, Table } from 'react-bootstrap';
import { FiPlus, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // 1. Importar el hook

export function VehiculosPage() {
  const navigate = useNavigate(); // 2. Inicializar el navegador

  return (
    <Container className="py-5 text-start">
      <h2 className="mb-4 fw-bold">Vehículos Registrados</h2>
      
      <div className="saas-card-dark p-0">
        <div className="p-4 border-bottom border-secondary d-flex justify-content-between align-items-center">
          <div>
            <h5 className="m-0 fw-bold text-white">Directorio de Vehículos</h5>
            <p className="text-muted small m-0 mt-1">Listado completo de vehículos y sus clientes titulares.</p>
          </div>
          {/* 3. Agregar el evento onClick para redirigir al formulario */}
          <button 
            className="btn-primary-custom d-flex align-items-center gap-2"
            onClick={() => navigate('/vehiculos/nuevo')}
          >
            <FiPlus /> Nuevo Vehículo
          </button>
        </div>
        
        <Table responsive variant="dark" className="mb-0 align-middle">
          <thead>
            <tr>
              <th className="text-center">Patente</th>
              <th>Nombre Modelo</th>
              <th>Cliente Titular</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center">
                <span className="badge bg-secondary text-white border border-secondary px-3 py-2" style={{ letterSpacing: '1px' }}>
                  AB 123 CD
                </span>
              </td>
              <td className="fw-bold text-white">Toyota Hilux 2.8 TDI</td>
              <td className="text-muted">Juan Pérez</td>
              <td className="text-center">
                <button className="btn-action-dark d-inline-flex align-items-center gap-1">
                  <FiClock size={14} /> Historial
                </button>
              </td>
            </tr>
            <tr>
              <td className="text-center">
                <span className="badge bg-secondary text-white border border-secondary px-3 py-2" style={{ letterSpacing: '1px' }}>
                  XYZ 987
                </span>
              </td>
              <td className="fw-bold text-white">Ford Fiesta Kinetic</td>
              <td className="text-muted">María Gómez</td>
              <td className="text-center">
                <button className="btn-action-dark d-inline-flex align-items-center gap-1">
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