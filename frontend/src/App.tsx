import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home';
import { Servicios } from './pages/Servicios';
import { Clientes } from './pages/Clientes';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/clientes" element={<Clientes />} />
      </Routes>
    </Layout>
  );
}

export default App;