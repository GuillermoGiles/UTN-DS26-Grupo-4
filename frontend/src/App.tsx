import { Routes, Route } from 'react-router-dom';
import { Footer } from './components/Footer';

// Importamos las dos páginas
import { HomePage } from './pages/HomePage';
import { VehiculosPage } from './pages/VehiculosPage';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      
      {/* El Router: Solo dibuja en pantalla el "element" que coincide con el "path".
        Nunca dibuja los dos al mismo tiempo.
      */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
      </Routes>

      {/* El Footer queda afuera del Router porque queremos que se vea en todas las pantallas */}
      <Footer nombreNegocio="Lavadero y Lubricentro San José" anio={2026} />
      
    </div>
  );
}

export default App;