import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

type NavbarSGIProps = {
  nombreUsuario: string;
};

export function NavbarSGI({ nombreUsuario }: NavbarSGIProps) {
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="mb-4 shadow-sm w-100">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          SGI San José
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Turnos Online</Nav.Link>
            <Nav.Link as={Link} to="/clientes">Clientes y Vehículos</Nav.Link>
            <Nav.Link as={Link} to="/servicios">Control de Insumos</Nav.Link>
          </Nav>
          <Nav>
            <Navbar.Text className="text-light">
              Usuario logueado: <span className="text-info fw-bold">{nombreUsuario}</span>
            </Navbar.Text>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}