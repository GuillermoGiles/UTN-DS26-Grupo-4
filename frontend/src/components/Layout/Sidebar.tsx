import { NavLink, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiCalendar, FiDroplet, FiLogOut, FiMail, FiPackage, FiPlusCircle, FiTool, FiUsers, FiUserCheck } from 'react-icons/fi';
import { BsCarFront } from 'react-icons/bs';
import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { Marca } from './Marca';
import { iniciales } from '../../utils/formato';
import type { Insumo } from '../../types/insumo';

function Enlace({ to, icono, children, contador }: { to: string; icono: ReactNode; children: ReactNode; contador?: number }) {
  return (
    <NavLink to={to} end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      {icono}
      <span>{children}</span>
      {contador ? <span className="contador" aria-label={`${contador} con stock bajo`}>{contador}</span> : null}
    </NavLink>
  );
}

/** Menú del personal (EMPLEADO y ADMIN). Cada rol ve solo lo que puede usar (C20). */
export function Sidebar({ abierta, onNavegar }: { abierta: boolean; onNavegar: () => void }) {
  const { usuario, logout, tieneRol } = useAuth();
  const navigate = useNavigate();
  const esAdmin = tieneRol('ADMIN');
  // Contador de insumos en el mínimo: la alerta visual que pide el alcance
  const { data: insumos } = useFetch<Insumo[]>(usuario ? '/insumos' : null);
  const bajos = (insumos ?? []).filter((i) => i.bajo).length;

  // Primero salir de la ruta protegida y después cerrar la sesión: si fuera al revés,
  // PrivateRoute guardaría esta pantalla como "de dónde venía" y el próximo login volvería acá.
  const salir = () => {
    navigate('/', { replace: true });
    logout();
  };

  return (
    <aside className={`sidebar${abierta ? ' abierta' : ''}`} onClick={(e) => (e.target as HTMLElement).closest('a') && onNavegar()}>
      <Marca a={esAdmin ? '/panel' : '/agenda'} />

      <nav aria-label="Menú del taller">
        <div className="sidebar-seccion">OPERACIÓN</div>
        {esAdmin && <Enlace to="/panel" icono={<FiBarChart2 />}>Panel</Enlace>}
        <Enlace to="/agenda" icono={<FiCalendar />}>Agenda</Enlace>
        <Enlace to="/clientes" icono={<FiUsers />}>Clientes</Enlace>
        <Enlace to="/vehiculos" icono={<BsCarFront />}>Vehículos</Enlace>
        <Enlace to="/insumos" icono={<FiPackage />} contador={bajos}>Insumos</Enlace>

        <div className="sidebar-seccion">CARGAR</div>
        <Enlace to="/turnos/nuevo" icono={<FiPlusCircle />}>Nuevo turno</Enlace>
        <Enlace to="/lavados/nuevo" icono={<FiDroplet />}>Ingreso al lavadero</Enlace>

        <div className="sidebar-seccion">NEGOCIO</div>
        <Enlace to="/servicios" icono={<FiTool />}>Servicios</Enlace>
        {esAdmin && <Enlace to="/correos" icono={<FiMail />}>Correos</Enlace>}
        {esAdmin && <Enlace to="/usuarios" icono={<FiUserCheck />}>Usuarios</Enlace>}
      </nav>

      <div className="sidebar-pie">
        {usuario && (
          <div className="sidebar-usuario">
            <span className="avatar">{iniciales(usuario.nombre)}</span>
            <div className="lh-sm">
              <div className="fw-bold small">{usuario.nombre}</div>
              <small style={{ color: '#a59a94' }}>{usuario.rol === 'ADMIN' ? 'Administrador' : 'Empleado'}</small>
            </div>
          </div>
        )}
        <button type="button" className="sidebar-salir" onClick={salir}>
          <FiLogOut /> Salir
        </button>
      </div>
    </aside>
  );
}
