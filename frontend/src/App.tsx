import './App.css'
import { NavbarSGI } from './components/NavbarSGI';
import { ResumenCaja } from './components/ResumenCaja';
import { ServicioDestacado } from './components/ServicioDestacado';
import TurnoCard from './components/TurnoCard';
import { Footer } from './components/Footer';

function App() {
  return (
    <>       
      <NavbarSGI nombreUsuario="Marcelo Bielsa" />

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

      <div id="stock" className="container mt-5 pt-4">
        <h2 className="mb-4 text-center">Gestión de Servicios e Insumos</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', margin: '2rem 0' }}>
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
      
      <div id="clientes" className="container mt-5 pt-4 mb-5 text-center">
        <h2>Módulo de Clientes y Vehículos</h2>
        <p className="text-muted">Listado de clientes</p>
      </div>

      <Footer nombreNegocio="Lavadero y Lubricentro San José" anio={2026} />
    </> 
  )
}

export default App