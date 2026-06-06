import { ResumenCaja } from '../components/ResumenCaja';
import TurnoCard from '../components/TurnoCard';
import { ServicioDestacado } from '../components/ServicioDestacado';

export function HomePage() {
  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Sistema de Gestión San Jose</h1>
      
      <div className="row">
        {/* Componente de Caja */}
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <ResumenCaja ingresos={185000} vehiculos={12} />
        </div>

        {/* Componentes de Turnos integrados */}
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <TurnoCard patente="AB 123 CD" servicio="Cambio de Aceite" />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <TurnoCard patente="XYZ 987" servicio="Lavado Completo Premium" />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
        <ServicioDestacado 
          nombre="Cambio de Aceite" 
          precio={45000} 
          descripcion="Servicio técnico completo con reemplazo de filtros esenciales según kilometraje." 
          tipo="lubricentro" 
        />
        <ServicioDestacado 
          nombre="Lavado Completo Premium" 
          precio={12000} 
          descripcion="Limpieza artesanal profunda exterior e interior con productos de alta calidad." 
          tipo="lavadero" 
        />
      </div>
    </div>
  );
}