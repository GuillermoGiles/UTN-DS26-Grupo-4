import { Navbar, Container, Nav } from 'react-bootstrap';

type NavbarSGIProps = {
  nombreUsuario: string;
};

export function NavbarSGI({ nombreUsuario }: NavbarSGIProps) {
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="mb-4 shadow-sm w-100">
      <Container fluid>
        <Navbar.Brand href="#home" className="fw-bold">
          SGI San José
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#turnos">Turnos Online</Nav.Link>
            <Nav.Link href="#clientes">Clientes y Vehículos</Nav.Link>
            <Nav.Link href="#stock">Control de Insumos</Nav.Link>
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