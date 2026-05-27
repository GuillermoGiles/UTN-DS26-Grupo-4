import './App.css'
import { ResumenCaja } from './components/ResumenCaja';

function App() {
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Sistema de Gestión Asensio</h1>
      
      <div className="row">
        <div className="col-12 col-md-6 col-lg-4">
          <ResumenCaja ingresos={185000} vehiculos={12} />
        </div>
      </div>
      
    </div>
  )
}

export default App