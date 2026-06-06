import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="sticky-top shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">🚗 Gestión San Jose</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/servicios">Servicios Destacados</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
