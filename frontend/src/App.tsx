import { Routes, Route } from 'react-router-dom';

// 1. Imports de tus compañeros (El Layout y sus páginas)
import {Layout} from './components/Layout/Layout';
import { Home } from './pages/Home';
import { Servicios } from './pages/Servicios';

// 2. Import de tu página
import { VehiculosPage } from './pages/VehiculosPage';

function App() {
  return (
    // El Layout ya tiene el Header y el Footer adentro. 
    // Todo lo que pongamos en el medio va a ser la prop "children".
    <Layout>
      
      {/* El motor de rutas */}
      <Routes>
        {/* La Home principal que hicieron ellos */}
        <Route path="/" element={<Home />} />
        
        {/* La página de Servicios de ellos */}
        <Route path="/servicios" element={<Servicios />} />
        
        {/* TU página de vehículos */}
        <Route path="/vehiculos" element={<VehiculosPage />} />
      </Routes>

    </Layout>
  );
}

export default App;