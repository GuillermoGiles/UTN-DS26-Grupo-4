import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { Marca } from './Marca';
import { iniciales } from '../../utils/formato';
import { Sidebar } from './Sidebar';

/**
 * Navegación según la sesión (C20). El personal usa la barra lateral; invitados y
 * clientes, la barra superior. Esconder un link no protege nada: cada ruta tiene su
 * PrivateRoute y la API su 403.
 */
export function Header() {
  const { usuario } = useAuth();
  if (usuario && usuario.rol !== 'CLIENTE') return <Sidebar abierta={false} onNavegar={() => {}} />;
  return <BarraSuperior />;
}

export function BarraSuperior() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  // Primero salir de la ruta protegida y después cerrar la sesión: si fuera al revés,
  // PrivateRoute guardaría esta pantalla como "de dónde venía" y el próximo login volvería acá.
  const salir = () => {
    navigate('/', { replace: true });
    logout();
  };

  return (
    <Navbar expand="md" className="navbar-sgi" collapseOnSelect>
      <Container>
        <Marca />
        <Navbar.Toggle aria-controls="nav-principal" />
        <Navbar.Collapse id="nav-principal" className="justify-content-end">
          <Nav className="align-items-md-center gap-1">
            <Nav.Link as={NavLink} to="/servicios" eventKey="servicios">Servicios</Nav.Link>
            {usuario?.rol === 'CLIENTE' ? (
              <>
                <Nav.Link as={NavLink} to="/turnos/nuevo" eventKey="reservar">Reservar turno</Nav.Link>
                <Nav.Link as={NavLink} to="/mi-cuenta" eventKey="mi-cuenta">Mi cuenta</Nav.Link>
                <div className="usuario-chip ms-md-3 mt-2 mt-md-0">
                  <div className="text-end d-none d-md-block">
                    <small>PORTAL DE CLIENTES</small>
                    <strong>{usuario.nombre}</strong>
                  </div>
                  <span className="avatar">{iniciales(usuario.nombre)}</span>
                  <button type="button" className="btn-sgi-ghost" onClick={salir}><FiLogOut /> Salir</button>
                </div>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" eventKey="login">Ingresar</Nav.Link>
                <Link to="/registro" className="btn-sgi ms-md-2">Crear cuenta</Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
