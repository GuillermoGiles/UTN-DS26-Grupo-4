import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home";
import { Servicios } from "./pages/Servicios";
import { VehiculosPage } from "./pages/VehiculosPage";
import { PanelGestion } from "./pages/PanelGestion";
import { PerfilCliente } from "./pages/PerfilCliente";
import { AltaUsuario } from "./pages/AltaUsuario";
import { AltaLavado } from "./pages/AltaLavado";
import { AltaTurno } from "./pages/AltaTurno";
import { Clientes } from './pages/Clientes';
import { ClienteNuevo } from './pages/ClienteNuevo';
import { ServicioNuevo } from './pages/ServicioNuevo';
import { VehiculoNuevo } from './pages/VehiculoNuevo';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/servicios/nuevo" element={<ServicioNuevo />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        <Route path="/vehiculos/nuevo" element={<VehiculoNuevo />} /> 
        <Route path="/panel" element={<PanelGestion />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/nuevo" element={<ClienteNuevo />} />
        <Route path="/perfil-cliente" element={<PerfilCliente />} />
        <Route path="/usuarios/nuevo" element={<AltaUsuario />} />
        <Route path="/lavados/nuevo" element={<AltaLavado />} />
        <Route path="/turnos/nuevo" element={<AltaTurno />} />
      </Routes>
    </Layout>
  );
}

export default App;