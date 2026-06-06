import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- 1. Agregás este import
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* <-- 2. Envolves el App acá */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)