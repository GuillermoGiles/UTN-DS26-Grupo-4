import { Container } from 'react-bootstrap';

export function Footer() {
  return (
    <footer className="border-top py-4 mt-auto" style={{ background: 'var(--surface)' }}>
      <Container className="d-flex flex-column flex-md-row justify-content-between gap-2 small text-muted">
        <span>Lavadero y Lubricentro San José · Lunes a sábado de 08:00 a 18:00</span>
        <span>Desarrollo de Software 2026 · UTN FRLP · Grupo 4</span>
      </Container>
    </footer>
  );
}
