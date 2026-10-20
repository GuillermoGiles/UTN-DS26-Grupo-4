import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiDroplet, FiShield } from 'react-icons/fi';
import { BsSpeedometer2 } from 'react-icons/bs';
import foto from '../assets/taller.jpg';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { ServicioDestacado } from '../components/ServicioDestacado';
import { Cargando, ErrorCarga } from '../components/Estado';
import { inicioPorRol } from '../utils/inicioPorRol';
import type { Servicio } from '../types/servicio';

const VENTAJAS = [
  { icono: <FiCalendar />, titulo: 'Reservá online', texto: 'Ves los horarios libres del día y elegís el que te quede cómodo. Sin llamar.' },
  { icono: <BsSpeedometer2 />, titulo: 'Próximo service', texto: 'Anotamos los km de cada visita y te avisamos cuándo le toca al auto.' },
  { icono: <FiShield />, titulo: 'Tu historial', texto: 'Todos los trabajos de cada vehículo en un solo lugar, siempre a mano.' },
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
      <Container className="py-4 py-md-5">
        <section className="hero" style={{ backgroundImage: `url(${foto})` }}>
          <span className="chip mb-3 align-self-start" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>LAVADERO Y LUBRICENTRO · LA PLATA</span>
          <h1>El cuidado que tu vehículo merece, sin vueltas.</h1>
          <p>Cambio de aceite, filtros, alineación y lavado. Reservá tu turno online y llevá el control del service de cada auto.</p>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <Link to={cta.to} className="btn-sgi">{cta.texto}</Link>
            <Link to="/servicios" className="btn-sgi-outline">Ver servicios y precios</Link>
          </div>
        </section>
      </Container>

      <Container className="pb-5">
        <Row className="g-4 mb-5">
          {VENTAJAS.map((v) => (
            <Col key={v.titulo} md={4}>
              <div className="d-flex gap-3">
                <span className="icon-circle">{v.icono}</span>
                <div><h3 className="fs-5 mb-1">{v.titulo}</h3><p className="text-muted mb-0">{v.texto}</p></div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="d-flex justify-content-between align-items-end mb-3">
          <div><span className="eyebrow">CATÁLOGO</span><h2 className="mb-0">Servicios más pedidos</h2></div>
          <Link to="/servicios" className="fw-bold">Ver todos</Link>
        </div>
        {loading && <Cargando />}
        {error && <ErrorCarga mensaje={error} />}
        <Row className="g-4 mb-5">
          {(servicios ?? []).slice(0, 3).map((s) => (
            <Col key={s.id} md={4} className="d-flex">
              <ServicioDestacado nombre={s.nombre} precio={s.precio} descripcion={s.desc} tipo={s.tipo} />
            </Col>
          ))}
        </Row>

        <Row className="g-4">
          <Col md={6}>
            <div className="card-sgi card-sgi-body d-flex gap-3 h-100">
              <span className="icon-circle"><FiClock /></span>
              <div><h3 className="fs-5 mb-1">Horarios</h3><p className="text-muted mb-0">Lunes a sábado de 08:00 a 18:00. Turnos cada 30 minutos.</p></div>
            </div>
          </Col>
          <Col md={6}>
            <div className="card-sgi card-sgi-body d-flex gap-3 h-100">
              <span className="icon-circle terracota"><FiDroplet /></span>
              <div><h3 className="fs-5 mb-1">Lavados sin turno</h3><p className="text-muted mb-0">También podés venir directamente: te registramos al llegar.</p></div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
