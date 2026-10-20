import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function NoEncontrada() {
  return (
    <Container className="py-5 text-center">
      <h2 className="fw-bold mb-2">Esta página no existe</h2>
      <p className="text-muted mb-4">Revisá la dirección o volvé al inicio.</p>
      <Link to="/" className="btn-sgi text-decoration-none">Ir al inicio</Link>
    </Container>
  );
}
