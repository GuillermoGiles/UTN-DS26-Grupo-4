import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="sticky-top shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          🚗 SGI San José
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Conectamos con todas las rutas de App.tsx */}
            <Nav.Link as={Link} to="/">Panel y Turnos</Nav.Link>
            <Nav.Link as={Link} to="/vehiculos">Vehículos</Nav.Link>
            <Nav.Link as={Link} to="/servicios">Gestión de Insumos</Nav.Link>
            <Nav.Link as={Link} to="/panel">Métricas</Nav.Link>
            <Nav.Link as={Link} to="/clientes">Clientes</Nav.Link>
          </Nav>
          <Nav>
            <Navbar.Text className="text-light">
              Usuario logueado: <span className="text-info fw-bold">Admin</span>
            </Navbar.Text>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}