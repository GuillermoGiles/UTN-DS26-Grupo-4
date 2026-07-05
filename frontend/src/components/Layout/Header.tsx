import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {FiTool, FiUserPlus, FiCalendar, FiPlusCircle } from 'react-icons/fi';
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
            
            {/* Agrupamos todas las Altas en un Dropdown */}
            <NavDropdown 
              title={<span className="d-inline-flex align-items-center gap-2"><FiPlusCircle /> Nuevos Registros</span>} 
              id="basic-nav-dropdown"
              className={path.includes('/nuevo') ? 'active fw-bold' : ''}
            >
              <NavDropdown.Item as={Link} to="/turnos/nuevo" className={path === '/turnos/nuevo' ? 'active' : ''}>
                <FiCalendar className="me-2 text-primary" /> Nuevo Turno
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/lavados/nuevo" className={path === '/lavados/nuevo' ? 'active' : ''}>
                <BsCarFrontFill className="me-2 text-primary" /> Ingreso Vehículo
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/usuarios/nuevo" className={path === '/usuarios/nuevo' ? 'active' : ''}>
                <FiUserPlus className="me-2 text-primary" /> Alta Usuario
              </NavDropdown.Item>
            </NavDropdown>
            
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