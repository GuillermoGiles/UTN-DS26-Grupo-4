import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiClock, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { ServicioDestacado } from '../components/ServicioDestacado';
import { Cargando, ErrorCarga } from '../components/Estado';
import { inicioPorRol } from '../utils/inicioPorRol';
import type { Servicio } from '../types/servicio';

const PASOS = [
  { titulo: 'Creá tu cuenta', texto: 'Con tu nombre, email y teléfono. Si ya viniste, tu historial aparece solo.' },
  { titulo: 'Elegí día y horario', texto: 'Ves los horarios libres del día y reservás el que te quede cómodo.' },
  { titulo: 'Traé el auto', texto: 'Te avisamos cuando está listo y anotamos los km para el próximo service.' },
];

export function Home() {
  const { usuario } = useAuth();
  const { data: servicios, loading, error } = useFetch<Servicio[]>('/servicios');

  const cta = !usuario
    ? { to: '/registro', texto: 'Reservar un turno' }
    : usuario.rol === 'CLIENTE'
      ? { to: '/turnos/nuevo', texto: 'Reservar un turno' }
      : { to: inicioPorRol(usuario.rol), texto: usuario.rol === 'ADMIN' ? 'Ir al panel' : 'Ver la agenda de hoy' };

  return (
    <>
      <Container className="py-5">
        <Row className="align-items-center g-5 py-lg-4">
          <Col lg={7}>
            <h1 className="display-5 fw-bold mb-3">Lavadero y lubricentro San José</h1>
            <p className="lead text-muted mb-4" style={{ maxWidth: '36rem' }}>
              Cambio de aceite, filtros, alineación y lavado de tu auto. Reservá online y llevá el control del
              service de cada vehículo sin anotar nada en un cuaderno.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link to={cta.to} className="btn-primary-custom text-decoration-none">{cta.texto}</Link>
              <Link to="/servicios" className="btn-outline-custom text-decoration-none">Ver servicios y precios</Link>
            </div>
          </Col>
          <Col lg={5}>
            <div className="saas-card-dark p-4">
              <h5 className="fw-bold mb-3">Cómo reservar</h5>
              <ol className="list-unstyled mb-0 d-flex flex-column gap-3">
                {PASOS.map((p, i) => (
                  <li key={p.titulo} className="d-flex gap-3">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-bold"
                      style={{ width: 32, height: 32, background: 'var(--primary-color)', color: '#fff' }}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <div className="fw-bold">{p.titulo}</div>
                      <small className="text-muted">{p.texto}</small>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Col>
        </Row>
      </Container>

      <div className="bg-light border-top py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-4">
            <h2 className="mb-0">Servicios más pedidos</h2>
            <Link to="/servicios">Ver todos</Link>
          </div>
          {loading && <Cargando />}
          {error && <ErrorCarga mensaje={error} />}
          <Row className="g-4">
            {(servicios ?? []).slice(0, 3).map((s) => (
              <Col key={s.id} md={4} className="d-flex">
                <ServicioDestacado nombre={s.nombre} precio={s.precio} descripcion={s.desc} tipo={s.tipo} />
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-4 text-muted">
          <Col md={6} className="d-flex gap-3">
            <FiClock size={24} className="text-primary flex-shrink-0" />
            <div>
              <div className="fw-bold text-dark">Horarios</div>
              Lunes a sábado de 08:00 a 18:00. Turnos cada 30 minutos.
            </div>
          </Col>
          <Col md={6} className="d-flex gap-3">
            <FiMapPin size={24} className="text-primary flex-shrink-0" />
            <div>
              <div className="fw-bold text-dark">Sin turno</div>
              Para lavados también podés venir directamente: te registramos al llegar.
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
