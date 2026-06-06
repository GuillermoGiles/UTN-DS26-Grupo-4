// Mi página propia para mostrar el catálogo de servicios, usando el componente ServicioDestacado que armé en la AG pasada.
import { Container } from 'react-bootstrap';
import { ServicioDestacado } from '../components/ServicioDestacado';

export function Servicios() {
  return (
    <div id="stock" className="container mt-5 pt-4">
      <h2 className="mb-4 text-center">Gestión de Servicios e Insumos</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
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
    </Container>
  );
}
