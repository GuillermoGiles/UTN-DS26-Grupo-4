import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiTool, FiUserPlus } from 'react-icons/fi';
import { BsCarFrontFill } from 'react-icons/bs';

export function Header() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <Navbar expand="lg" className="navbar-custom sticky-top py-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <BsCarFrontFill style={{ color: 'var(--primary-color)' }} size={24} />
          <span className="fw-bold">Gestión San José</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto gap-1">
            <Nav.Link as={Link} to="/" className={`d-flex align-items-center gap-2 ${path === '/' ? 'active' : ''}`}>
              <FiHome /> Panel y Turnos
            </Nav.Link>
            <Nav.Link as={Link} to="/vehiculos" className={`d-flex align-items-center gap-2 ${path === '/vehiculos' ? 'active' : ''}`}>
              <BsCarFrontFill /> Vehículos
            </Nav.Link>
            <Nav.Link as={Link} to="/servicios" className={`d-flex align-items-center gap-2 ${path === '/servicios' ? 'active' : ''}`}>
              <FiTool /> Gestión Insumos
            </Nav.Link>
            <Nav.Link as={Link} to="/panel" className={`d-flex align-items-center gap-2 ${path === '/panel' ? 'active' : ''}`}>
              Métricas
            </Nav.Link>
            <Nav.Link as={Link} to="/clientes" className={`d-flex align-items-center gap-2 ${path === '/clientes' ? 'active' : ''}`}>
              Clientes
            </Nav.Link>
            <Nav.Link as={Link} to="/usuarios/nuevo" className={`d-flex align-items-center gap-2 ${path === '/usuarios/nuevo' ? 'active' : ''}`}>
              <FiUserPlus /> Alta Usuario
            </Nav.Link>
          </Nav>
          <Nav>
            <Navbar.Text className="text-muted">
              Usuario logueado: <span className="text-primary fw-bold">Admin</span>
            </Navbar.Text>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}