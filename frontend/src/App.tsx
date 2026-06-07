import { Routes, Route } from 'react-router-dom';


import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home';
import { Servicios } from './pages/Servicios';

import { VehiculosPage } from './pages/VehiculosPage';
import { PanelGestion } from './pages/PanelGestion'; 

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        
        
        <Route path="/panel" element={<PanelGestion />} /> 
      </Routes>
    </Layout>
  );
}

export default App;