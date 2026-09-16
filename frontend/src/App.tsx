import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { PrivateRoute } from "./components/PrivateRoute";
import { Login } from "./pages/Login";
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
import { SinPermiso } from './pages/SinPermiso';
import { AuthProvider } from './context/AuthContext';


function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* ---------- Públicas: sin login ---------- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/sin-permiso" element={<SinPermiso />} />

          {/* ---------- Logueado, cualquier rol (CLIENTE / EMPLEADO / ADMIN) ---------- */}
          <Route element={<PrivateRoute />}>
            <Route path="/turnos/nuevo" element={<AltaTurno />} />
            <Route path="/perfil-cliente" element={<PerfilCliente />} />
          </Route>

          {/* ---------- Operativas: EMPLEADO o ADMIN ---------- */}
          <Route element={<PrivateRoute rol={['EMPLEADO', 'ADMIN']} />}>
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/nuevo" element={<ClienteNuevo />} />
            <Route path="/vehiculos" element={<VehiculosPage />} />
            <Route path="/vehiculos/nuevo" element={<VehiculoNuevo />} />
            <Route path="/lavados/nuevo" element={<AltaLavado />} />
          </Route>

          {/* ---------- Administración: solo ADMIN ---------- */}
          <Route element={<PrivateRoute rol="ADMIN" />}>
            <Route path="/servicios/nuevo" element={<ServicioNuevo />} />
            <Route path="/usuarios/nuevo" element={<AltaUsuario />} />
            <Route path="/panel" element={<PanelGestion />} />
          </Route>
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
