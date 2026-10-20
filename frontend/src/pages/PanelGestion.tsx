import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiCalendar, FiCheckCircle, FiDollarSign, FiPlus } from 'react-icons/fi';
import { BsCarFront } from 'react-icons/bs';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { EncabezadoPagina } from '../components/Formulario';
import { EstadoTurnoBadge, Patente, ServiceBadge } from '../components/Badges';
import { fechaCorta, mostrarPatente, pesos } from '../utils/formato';
import { TEXTO_ESTADO_TURNO } from '../utils/estados';
import type { ResumenPanel } from '../types/panel';
import type { EstadoTurno } from '../types/turno';

const COLOR_ESTADO: Record<EstadoTurno, string> = {
  PENDIENTE: 'var(--primary)', CONFIRMADO: 'var(--teal)', EN_PROCESO: 'var(--amber)', COMPLETADO: '#2f7a46', CANCELADO: 'var(--muted)',
};

function saludo() {
  const h = Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' }));
  return h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
}

/** Panel del ADMIN con los números reales del día (GET /api/panel/resumen). */
export function PanelGestion() {
  const { usuario } = useAuth();
  const { data: r, loading, error } = useFetch<ResumenPanel>('/panel/resumen');

  if (loading) return <Cargando />;
  if (error) return <div className="page"><ErrorCarga mensaje={error} /></div>;
  if (!r) return null;

  const enTaller = r.estados.EN_PROCESO;
  const completados = r.estados.COMPLETADO;
  const maxSemana = Math.max(...r.semana.map((d) => d.total), 1);
  const totalSemana = r.semana.reduce((s, d) => s + d.total, 0);
  const proximos = r.agenda.filter((t) => t.estado !== 'CANCELADO' && t.estado !== 'COMPLETADO');

  const kpis = [
    { icono: <FiCalendar />, clase: '', etiqueta: 'TURNOS DE HOY', valor: r.turnosDelDia, nota: `${r.turnosPendientes} por atender` },
    { icono: <BsCarFront />, clase: 'ambar', etiqueta: 'VEHÍCULOS EN TALLER', valor: enTaller, nota: 'En proceso ahora' },
    { icono: <FiDollarSign />, clase: '', etiqueta: 'CAJA DEL DÍA', valor: pesos(r.ingresosDelDia), nota: 'Turnos completados y lavados' },
    { icono: <FiCheckCircle />, clase: 'terracota', etiqueta: 'AUTOS ATENDIDOS', valor: r.vehiculosAtendidos, nota: `${completados} turnos + ${r.lavados.length} lavados` },
  ];

  return (
    <div className="page">
      <EncabezadoPagina
        eyebrow={`HOY · ${fechaCorta(r.fecha).toUpperCase()}`}
        titulo={`${saludo()}, ${usuario?.nombre.split(' ')[0] ?? ''}`}
        texto={`Tenés ${proximos.length} turnos por atender hoy y ${enTaller} vehículo${enTaller === 1 ? '' : 's'} en el taller.`}
        acciones={<Link to="/turnos/nuevo" className="btn-sgi"><FiPlus /> Nuevo turno</Link>}
      />

      <Row className="g-3 mb-4">
        {kpis.map((k) => (
          <Col key={k.etiqueta} sm={6} xl={3}>
            <div className="card-sgi kpi">
              <span className={`icon-circle ${k.clase}`}>{k.icono}</span>
              <div className="kpi-label">{k.etiqueta}</div>
              <div className="kpi-value">{k.valor}</div>
              <div className="kpi-note mt-2">{k.nota}</div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <section className="card-sgi h-100">
            <div className="card-sgi-header">
              <div><h5>Próximos turnos</h5><small className="text-muted">Agenda de hoy</small></div>
              <Link to="/agenda" className="btn-sgi-outline btn-sm-sgi">Ver agenda</Link>
            </div>
            {proximos.length === 0 ? <Vacio>No quedan turnos por atender hoy.</Vacio> : proximos.map((t) => (
              <Link key={t.id} to="/agenda" className="fila">
                <span className="hora-box">{t.hora}</span>
                <div className="flex-grow-1">
                  <div className="fila-titulo">{t.cliente.nombre}</div>
                  <div className="fila-sub">{t.vehiculo ? `${t.vehiculo.marca} ${t.vehiculo.modelo} · ${mostrarPatente(t.vehiculo.patente)}` : 'Sin vehículo'}</div>
                </div>
                <div className="d-none d-md-block flex-grow-1 small">{t.servicio.nombre}</div>
                <EstadoTurnoBadge estado={t.estado} />
              </Link>
            ))}
          </section>
        </Col>
        <Col lg={4}>
          <section className="card-sgi h-100">
            <div className="card-sgi-header"><h5>Estados de hoy</h5><small className="text-muted">{r.turnosDelDia} turnos</small></div>
            <div className="card-sgi-body d-flex flex-column gap-3">
              {(Object.keys(COLOR_ESTADO) as EstadoTurno[]).map((e) => (
                <div key={e}>
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>{TEXTO_ESTADO_TURNO[e]}</span><span>{r.estados[e]}</span>
                  </div>
                  <div className="progreso">
                    <span style={{ width: `${r.turnosDelDia ? (r.estados[e] / r.turnosDelDia) * 100 : 0}%`, background: COLOR_ESTADO[e] }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <section className="card-sgi h-100">
            <div className="card-sgi-header"><div><h5>Caja de la semana</h5><small className="text-muted">{pesos(totalSemana)} en los últimos 7 días</small></div></div>
            <div className="card-sgi-body">
              <div className="barras" role="img" aria-label="Ingresos de los últimos 7 días">
                {r.semana.map((d, i) => (
                  <div key={d.fecha} className={`barra${i === r.semana.length - 1 ? ' hoy' : ''}`} title={`${fechaCorta(d.fecha)}: ${pesos(d.total)}`}>
                    <div className="barra-col" style={{ height: `${(d.total / maxSemana) * 100}%` }} />
                    <small>{i === r.semana.length - 1 ? 'HOY' : fechaCorta(d.fecha).split(' ')[0].toUpperCase()}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Col>
        <Col lg={3}>
          <section className="card-sgi h-100">
            <div className="card-sgi-header"><h5>Stock bajo</h5><Link to="/insumos" className="small">Insumos</Link></div>
            {r.insumosBajos.length === 0 ? <Vacio>Todo el stock está por encima del mínimo.</Vacio> : r.insumosBajos.map((i) => (
              <div key={i.id} className="fila">
                <span className="icon-circle terracota"><FiAlertTriangle /></span>
                <div>
                  <div className="fila-titulo small">{i.nombre}</div>
                  <div className="fila-sub">Quedan {i.stock} {i.unidad} · mínimo {i.stockMinimo}</div>
                </div>
              </div>
            ))}
          </section>
        </Col>
        <Col lg={3}>
          <section className="card-sgi h-100">
            <div className="card-sgi-header"><h5>Para avisar</h5></div>
            {r.serviceAtrasado.length === 0 ? <Vacio>Todos los autos tienen el service al día.</Vacio> : r.serviceAtrasado.map((v) => (
              <Link key={v.id} to={`/vehiculos/${v.id}`} className="fila flex-column align-items-start gap-2">
                <div className="d-flex justify-content-between w-100 align-items-center"><Patente patente={v.patente} /><ServiceBadge service={v.service} /></div>
                <div className="fila-sub">{v.cliente.nombre} · {v.cliente.telefono}</div>
              </Link>
            ))}
          </section>
        </Col>
      </Row>
    </div>
  );
}
