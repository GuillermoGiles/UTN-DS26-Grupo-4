import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiCalendar, FiLogOut, FiPlusCircle, FiUser } from 'react-icons/fi';
import { BsCarFrontFill } from 'react-icons/bs';
import { useAuth } from '../../hooks/useAuth';
import type { Rol } from '../../types/sesion';

const NOMBRE_ROL: Record<Rol, string> = { ADMIN: 'Administrador', EMPLEADO: 'Empleado', CLIENTE: 'Cliente' };

/**
 * NavBar según la sesión (C20): cada rol ve solo los links que puede usar.
 * Esconder el link no protege nada: la ruta tiene su PrivateRoute y la API su 403.
 */
export function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const rol = usuario?.rol;
  const esPersonal = rol === 'EMPLEADO' || rol === 'ADMIN';

  const salir = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <Navbar expand="lg" className="navbar-custom sticky-top py-3" collapseOnSelect>
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <BsCarFrontFill style={{ color: 'var(--primary-color)' }} size={24} />
          <span className="fw-bold">San José</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav-principal" />
        <Navbar.Collapse id="nav-principal">
          <Nav className="me-auto gap-1">
            <Nav.Link as={NavLink} to="/servicios" eventKey="servicios">Servicios</Nav.Link>

            {rol === 'CLIENTE' && (
              <>
                <Nav.Link as={NavLink} to="/turnos/nuevo" eventKey="reservar">Reservar turno</Nav.Link>
                <Nav.Link as={NavLink} to="/mi-cuenta" eventKey="mi-cuenta">Mi cuenta</Nav.Link>
              </>
            )}

            {esPersonal && (
              <>
                <Nav.Link as={NavLink} to="/agenda" eventKey="agenda">Agenda</Nav.Link>
                <Nav.Link as={NavLink} to="/clientes" eventKey="clientes">Clientes</Nav.Link>
                <Nav.Link as={NavLink} to="/vehiculos" eventKey="vehiculos">Vehículos</Nav.Link>
              </>
            )}

            {rol === 'ADMIN' && (
              <>
                <Nav.Link as={NavLink} to="/panel" eventKey="panel">Panel</Nav.Link>
                <Nav.Link as={NavLink} to="/usuarios" eventKey="usuarios">Usuarios</Nav.Link>
              </>
            )}

            {esPersonal && (
              <NavDropdown
                id="nav-nuevo"
                title={<span className="d-inline-flex align-items-center gap-2"><FiPlusCircle /> Nuevo</span>}
              >
                <NavDropdown.Item as={Link} to="/turnos/nuevo">
                  <FiCalendar className="me-2 text-primary" /> Turno
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/lavados/nuevo">
                  <BsCarFrontFill className="me-2 text-primary" /> Ingreso al lavadero
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/clientes/nuevo">
                  <FiUser className="me-2 text-primary" /> Cliente
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/vehiculos/nuevo">
                  <BsCarFrontFill className="me-2 text-primary" /> Vehículo
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>

          <Nav className="align-items-lg-center gap-2">
            {usuario ? (
              <>
                <Navbar.Text className="text-muted">
                  <span className="fw-bold text-dark">{usuario.nombre}</span>{' '}
                  <small>({NOMBRE_ROL[usuario.rol]})</small>
                </Navbar.Text>
                <button type="button" className="btn-outline-custom d-inline-flex align-items-center gap-2 py-1" onClick={salir}>
                  <FiLogOut /> Salir
                </button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" eventKey="login">Ingresar</Nav.Link>
                <Link to="/registro" className="btn-primary-custom text-decoration-none py-1">Crear cuenta</Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
