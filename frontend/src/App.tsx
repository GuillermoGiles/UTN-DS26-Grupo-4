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

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        <Route path="/panel" element={<PanelGestion />} />
        <Route path="/clientes" element={<PerfilCliente />} />
        <Route path="/usuarios/nuevo" element={<AltaUsuario />} />
        <Route path="/lavados/nuevo" element={<AltaLavado />} />
        
        {/* Nueva ruta para el formulario de alta de turnos */}
        <Route path="/turnos/nuevo" element={<AltaTurno />} />
      </Routes>
    </Layout>
  );
}

export default App;