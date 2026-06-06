// Página de inicio. Acá moví los componentes de mis compañeros (Caja y Turnos) que antes estaban sueltos en App.tsx.
import { ResumenCaja } from '../components/ResumenCaja';
import TurnoCard from '../components/TurnoCard';

export function Home() {
  return (
    <>
      <div id="turnos" className="container mt-4 pt-4">
        <h1 className="mb-4">Panel de Turnos y Caja</h1> 
        <div className="row">
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <ResumenCaja ingresos={185000} vehiculos={12} />
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <TurnoCard patente="AB 123 CD" servicio="Cambio de Aceite" />
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <TurnoCard patente="XYZ 987" servicio="Lavado Completo Premium" />
          </div>
        </div>
      </div>

      <div id="clientes" className="container mt-5 pt-4 mb-5 text-center">
        <h2>Módulo de Clientes y Vehículos</h2>
        <p className="text-muted">Listado de clientes</p>
      </div>
    </>
  );
}
