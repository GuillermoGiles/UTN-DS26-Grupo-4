import { Container, Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { EstadoTurnoBadge, Patente, ServiceBadge } from '../components/Badges';
import { fechaCorta, pesos } from '../utils/formato';
import type { ResumenPanel } from '../types/panel';

/** Panel del ADMIN con los números reales del día (GET /api/panel/resumen). */
export function PanelGestion() {
  const { data: r, loading, error } = useFetch<ResumenPanel>('/panel/resumen');

  if (loading) return <Cargando />;
  if (error) return <Container className="py-5"><ErrorCarga mensaje={error} /></Container>;
  if (!r) return null;

  const indicadores = [
    { etiqueta: 'Caja del día', valor: pesos(r.ingresosDelDia), nota: 'Turnos completados y lavados' },
    { etiqueta: 'Autos atendidos', valor: r.vehiculosAtendidos, nota: 'Hoy' },
    { etiqueta: 'Turnos de hoy', valor: r.turnosDelDia, nota: 'Incluye cancelados' },
    { etiqueta: 'Por atender', valor: r.turnosPendientes, nota: 'Pendientes y confirmados, de hoy en adelante' },
  ];

  return (
    <Container className="py-5 text-start">
      <h2 className="mb-1 fw-bold">Panel</h2>
      <p className="text-muted mb-4">Hoy, {fechaCorta(r.fecha)}</p>

      <Row className="mb-4 g-4">
        {indicadores.map((i) => (
          <Col key={i.etiqueta} sm={6} lg={3}>
            <div className="saas-card-dark p-4 h-100">
              <div className="text-muted small mb-2">{i.etiqueta}</div>
              <div className="fs-2 fw-bold">{i.valor}</div>
              <div className="text-muted small">{i.nota}</div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <section className="saas-card-dark p-0 h-100">
            <div className="p-4 border-bottom border-secondary d-flex justify-content-between">
              <h5 className="m-0 fw-bold">Agenda de hoy</h5>
              <Link to="/agenda">Abrir agenda</Link>
            </div>
            {r.agenda.length === 0 ? <Vacio>No hay turnos hoy.</Vacio> : (
              <Table responsive variant="dark" className="mb-0 align-middle">
                <tbody>
                  {r.agenda.map((t) => (
                    <tr key={t.id}>
                      <td className="fw-bold">{t.hora}</td>
                      <td>{t.cliente.nombre}</td>
                      <td>{t.servicio.nombre}</td>
                      <td><EstadoTurnoBadge estado={t.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </section>
        </Col>
        <Col lg={5}>
          <section className="saas-card-dark p-0 h-100">
            <div className="p-4 border-bottom border-secondary">
              <h5 className="m-0 fw-bold">Para avisar: service vencido o próximo</h5>
            </div>
            {r.serviceAtrasado.length === 0 ? <Vacio>Todos los autos tienen el service al día.</Vacio> : (
              <ul className="list-unstyled m-0">
                {r.serviceAtrasado.map((v) => (
                  <li key={v.id} className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <Link to={`/vehiculos/${v.id}`} className="text-decoration-none"><Patente patente={v.patente} /></Link>
                      <div className="small mt-1">{v.cliente.nombre} · <a href={`tel:${v.cliente.telefono}`}>{v.cliente.telefono}</a></div>
                    </div>
                    <ServiceBadge service={v.service} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Col>
      </Row>
    </Container>
  );
}
