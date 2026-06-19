import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home';
import { Servicios } from './pages/Servicios';
import { VehiculosPage } from './pages/VehiculosPage';
import { PanelGestion } from './pages/PanelGestion'; 
import { PerfilCliente } from './pages/PerfilCliente';
import { ServicioNuevo } from './pages/ServicioNuevo';
import { SERVICIOS_MOCK } from './data/servicios';
import type { Servicio } from './types/servicio';

function App() {
  const [servicios, setServicios] = useState<Servicio[]>(SERVICIOS_MOCK);

  const agregarServicio = (nuevo: Servicio) => {
    setServicios([...servicios, nuevo]);
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios servicios={servicios} />} />
        <Route path="/servicios/nuevo" element={<ServicioNuevo onAgregar={agregarServicio} />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        <Route path="/panel" element={<PanelGestion />} /> 
        <Route path="/clientes" element={<PerfilCliente />} /> 
      </Routes>
    </Layout>
  );
}

export default App;