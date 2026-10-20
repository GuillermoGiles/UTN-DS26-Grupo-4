import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Servicios } from './pages/Servicios';
import { SinPermiso } from './pages/SinPermiso';
import { NoEncontrada } from './pages/NoEncontrada';
import { AltaTurno } from './pages/AltaTurno';
import { MiCuenta } from './pages/MiCuenta';
import { Agenda } from './pages/Agenda';
import { Clientes } from './pages/Clientes';
import { ClienteNuevo } from './pages/ClienteNuevo';
import { ClienteDetalle } from './pages/ClienteDetalle';
import { VehiculosPage } from './pages/VehiculosPage';
import { VehiculoNuevo } from './pages/VehiculoNuevo';
import { VehiculoDetalle } from './pages/VehiculoDetalle';
import { AltaLavado } from './pages/AltaLavado';
import { PanelGestion } from './pages/PanelGestion';
import { ServicioForm } from './pages/ServicioForm';
import { Usuarios } from './pages/Usuarios';
import { AltaUsuario } from './pages/AltaUsuario';
import { Insumos } from './pages/Insumos';
import { Correos } from './pages/Correos';

// Las barreras replican la Matriz de Permisos (Documentación/05 - Diseño de API).
function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* ---------- Públicas: sin login ---------- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/sin-permiso" element={<SinPermiso />} />

          {/* ---------- Logueado, cualquier rol ---------- */}
          <Route element={<PrivateRoute />}>
            <Route path="/turnos/nuevo" element={<AltaTurno />} />
          </Route>

          {/* ---------- Portal del cliente ---------- */}
          <Route element={<PrivateRoute rol="CLIENTE" />}>
            <Route path="/mi-cuenta" element={<MiCuenta />} />
          </Route>

          {/* ---------- Operativas: EMPLEADO o ADMIN ---------- */}
          <Route element={<PrivateRoute rol={['EMPLEADO', 'ADMIN']} />}>
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/nuevo" element={<ClienteNuevo />} />
            <Route path="/clientes/:id" element={<ClienteDetalle />} />
            <Route path="/vehiculos" element={<VehiculosPage />} />
            <Route path="/vehiculos/nuevo" element={<VehiculoNuevo />} />
            <Route path="/vehiculos/:id" element={<VehiculoDetalle />} />
            <Route path="/lavados/nuevo" element={<AltaLavado />} />
            <Route path="/insumos" element={<Insumos />} />
          </Route>

          {/* ---------- Administración: solo ADMIN ---------- */}
          <Route element={<PrivateRoute rol="ADMIN" />}>
            <Route path="/panel" element={<PanelGestion />} />
            <Route path="/servicios/nuevo" element={<ServicioForm />} />
            <Route path="/servicios/:id/editar" element={<ServicioForm />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/usuarios/nuevo" element={<AltaUsuario />} />
            <Route path="/correos" element={<Correos />} />
          </Route>

          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
