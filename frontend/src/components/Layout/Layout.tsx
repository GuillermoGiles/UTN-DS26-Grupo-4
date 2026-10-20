import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { BarraSuperior } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

// Título y bajada de la barra superior del personal, según la ruta
const TITULOS: [RegExp, string, string][] = [
  [/^\/panel/, 'Resumen operativo', 'Caja, agenda y alertas del día'],
  [/^\/agenda/, 'Agenda', 'Turnos del día y autos sin turno'],
  [/^\/clientes\/nuevo/, 'Nuevo cliente', 'Alta en el mostrador'],
  [/^\/clientes\/\d+/, 'Ficha del cliente', 'Datos, vehículos y turnos'],
  [/^\/clientes/, 'Clientes', 'Directorio con búsqueda por nombre, DNI o patente'],
  [/^\/vehiculos\/nuevo/, 'Nuevo vehículo', 'Alta de un auto para un cliente'],
  [/^\/vehiculos\/\d+/, 'Historial del vehículo', 'Service, turnos y lavados'],
  [/^\/vehiculos/, 'Vehículos', 'Kilometraje y control del próximo service'],
  [/^\/insumos/, 'Insumos', 'Stock de aceites, filtros y productos de lavado'],
  [/^\/turnos\/nuevo/, 'Nuevo turno', 'Reserva con horarios libres'],
  [/^\/lavados\/nuevo/, 'Ingreso al lavadero', 'Autos que llegan sin turno'],
  [/^\/servicios\/(nuevo|\d+)/, 'Servicio', 'Precio, descripción e insumos que consume'],
  [/^\/servicios/, 'Servicios', 'Catálogo y precios'],
  [/^\/correos/, 'Correos', 'Recordatorios enviados a los clientes'],
  [/^\/usuarios/, 'Usuarios', 'Cuentas del personal'],
];

const RUTAS_AUTH = ['/login', '/registro'];

function fechaDeHoy() {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export function Layout({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Login y registro: pantalla partida, sin barras
  if (RUTAS_AUTH.includes(pathname)) return <>{children}</>;

  // Personal: barra lateral oscura + barra superior con el título de la sección
  if (usuario && usuario.rol !== 'CLIENTE') {
    const [, titulo, sub] = TITULOS.find(([re]) => re.test(pathname)) ?? [null, 'Gestión San José', 'Lavadero y lubricentro'];
    return (
      <div className="shell">
        <Sidebar abierta={menuAbierto} onNavegar={() => setMenuAbierto(false)} />
        {menuAbierto && <div className="sidebar-fondo" onClick={() => setMenuAbierto(false)} aria-hidden="true" />}
        <div className="shell-main">
          <header className="topbar">
            <button type="button" className="btn-menu" onClick={() => setMenuAbierto((v) => !v)} aria-label="Abrir menú">
              <FiMenu size={20} />
            </button>
            <div>
              <div className="topbar-titulo">{titulo}</div>
              <div className="topbar-sub">{sub}</div>
            </div>
            <div className="topbar-fecha">{fechaDeHoy()}</div>
          </header>
          <main className="flex-grow-1">{children}</main>
        </div>
      </div>
    );
  }

  // Invitados y clientes: barra superior
  return (
    <div className="min-vh-100 d-flex flex-column">
      <BarraSuperior />
      <main className="flex-grow-1">{children}</main>
      <Footer />
    </div>
  );
}
