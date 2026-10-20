import { Container } from 'react-bootstrap';

export function Footer() {
  return (
    <footer className="bg-white border-top text-muted py-4 mt-auto">
      <Container className="d-flex flex-column flex-md-row justify-content-between gap-2 small">
        <span>Lavadero y Lubricentro San José · Lunes a sábado de 08:00 a 18:00</span>
        <span>SGI San José — Desarrollo de Software 2026, UTN FRLP, Grupo 4</span>
      </Container>
    </footer>
  );
}
