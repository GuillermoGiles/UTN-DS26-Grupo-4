import { useState } from 'react';
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
import type { Cliente } from './schemas/clienteSchema';

const clientesIniciales: Cliente[] = [
  { id: 1, nombre: 'Blasko Telechea', vehiculo: 'Fiat Duna', patente: 'FGH 452', telefono: '11-1234-5678' },
  { id: 2, nombre: 'Lautaro Diguilmi', vehiculo: 'Toyota Corolla', patente: 'XTZ 987', telefono: '11-9876-5432' },
  { id: 3, nombre: 'Federico Corbalan', vehiculo: 'VW Gol', patente: 'EF 456 GH', telefono: '11-4567-8901' },
];

function App() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciales);

  const agregarCliente = (nuevo: Cliente) => {
    setClientes([...clientes, nuevo]);
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        <Route path="/panel" element={<PanelGestion />} />
        <Route path="/clientes" element={<Clientes clientes={clientes} />} />
        <Route path="/clientes/nuevo" element={<ClienteNuevo onAgregar={agregarCliente} />} />
        <Route path="/perfil-cliente" element={<PerfilCliente />} />
        <Route path="/usuarios/nuevo" element={<AltaUsuario />} />
        <Route path="/lavados/nuevo" element={<AltaLavado />} />
        
        {/* Nueva ruta para el formulario de alta de turnos */}
        <Route path="/turnos/nuevo" element={<AltaTurno />} />
      </Routes>
    </Layout>
  );
}

export default App;
