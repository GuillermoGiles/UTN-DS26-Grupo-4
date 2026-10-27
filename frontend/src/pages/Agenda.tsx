import { useState } from 'react';
import { Row, Col, Form, Alert } from 'react-bootstrap';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiPlus, FiSend, FiUser, FiTool, FiMessageSquare, FiClock } from 'react-icons/fi';
import { BsCarFront } from 'react-icons/bs';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { EncabezadoPagina } from '../components/Formulario';
import { EstadoTurnoBadge, Patente } from '../components/Badges';
import { fechaCorta, hoyAR, horaDe, horaActualAR, mensajeDeError, mostrarPatente, pesos, sumarDias } from '../utils/formato';
import { TEXTO_ESTADO_TURNO } from '../utils/estados';
import { nombresServicios, totalServicios, ESTADOS_TURNO, type Disponibilidad, type EstadoTurno, type TurnoConDetalle } from '../types/turno';
import type { Lavado } from '../types/lavado';

/** Agenda operativa (wireframe 02): turnos del día, detalle con acciones y autos sin turno. */
export function Agenda() {
  const { tieneRol } = useAuth();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const fecha = params.get('fecha') ?? hoyAR();
  const turnoCreado = (location.state as { turnoCreado?: number } | null)?.turnoCreado;

  const turnos = useFetch<TurnoConDetalle[]>(`/turnos?fecha=${fecha}`);
  const lavados = useFetch<Lavado[]>(`/lavados?fecha=${fecha}`);
  const [elegidoId, setElegidoId] = useState<number | null>(turnoCreado ?? null);
  const [filtro, setFiltro] = useState<EstadoTurno | ''>('');
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  const lista = (turnos.data ?? []).filter((t) => !filtro || t.estado === filtro);
  const elegido = (turnos.data ?? []).find((t) => t.id === elegidoId) ?? lista[0] ?? null;
  const cuenta = (e: EstadoTurno) => (turnos.data ?? []).filter((t) => t.estado === e).length;
  const totalLavados = (lavados.data ?? []).reduce((s, l) => s + l.precio, 0);

  const irA = (nueva: string) => {
    setElegidoId(null);
    setParams(nueva === hoyAR() ? {} : { fecha: nueva });
  };

  const accion = async (llamada: () => Promise<unknown>, ok: string, recargar: () => void) => {
    setAviso(null);
    try {
      await llamada();
      setAviso({ tipo: 'success', texto: ok });
      recargar();
    } catch (err) {
      setAviso({ tipo: 'danger', texto: mensajeDeError(err) });
    }
  };

  const cambiarEstado = (t: TurnoConDetalle, estado: EstadoTurno) =>
    accion(() => apiFetch(`/turnos/${t.id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
      `Turno de las ${t.hora}: ${TEXTO_ESTADO_TURNO[estado].toLowerCase()}.`, turnos.recargar);

  const recordatorio = (t: TurnoConDetalle) =>
    accion(() => apiFetch(`/turnos/${t.id}/recordatorio`, { method: 'POST' }),
      `Recordatorio registrado para ${t.cliente.email}.`, turnos.recargar);

  const anularLavado = (l: Lavado) => {
    if (!window.confirm(`¿Anular el lavado de ${l.vehiculo.patente}?`)) return;
    accion(() => apiFetch(`/lavados/${l.id}`, { method: 'DELETE' }), 'Lavado anulado.', lavados.recargar);
  };

  return (
    <div className="page">
      <EncabezadoPagina
        eyebrow="AGENDA"
        titulo={fecha === hoyAR() ? `Hoy, ${fechaCorta(fecha)}` : fechaCorta(fecha)}
        texto="Elegí un turno para ver el detalle, cambiar su estado, reprogramarlo o mandarle el recordatorio."
        acciones={<Link to={`/turnos/nuevo?fecha=${fecha}`} className="btn-sgi"><FiPlus /> Nuevo turno</Link>}
      />

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <button type="button" className="btn-sgi-outline btn-sm-sgi" onClick={() => irA(sumarDias(fecha, -1))} aria-label="Día anterior"><FiChevronLeft /></button>
        <Form.Control type="date" value={fecha} onChange={(e) => e.target.value && irA(e.target.value)} style={{ width: 180 }} aria-label="Fecha" />
        <button type="button" className="btn-sgi-outline btn-sm-sgi" onClick={() => irA(sumarDias(fecha, 1))} aria-label="Día siguiente"><FiChevronRight /></button>
        {fecha !== hoyAR() && <button type="button" className="btn-sgi-ghost" onClick={() => irA(hoyAR())}>Volver a hoy</button>}
        <Form.Select value={filtro} onChange={(e) => setFiltro(e.target.value as EstadoTurno | '')} style={{ width: 200 }} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {ESTADOS_TURNO.map((e) => <option key={e} value={e}>{TEXTO_ESTADO_TURNO[e]}</option>)}
        </Form.Select>
      </div>

      <Row className="g-3 mb-4">
        {[['Turnos', (turnos.data ?? []).length], ['Confirmados', cuenta('CONFIRMADO')], ['En taller', cuenta('EN_PROCESO')], ['Completados', cuenta('COMPLETADO')], ['Cancelados', cuenta('CANCELADO')]].map(([t, n]) => (
          <Col key={t} xs={6} md>
            <div className="card-sgi px-3 py-2 d-flex align-items-baseline gap-2">
              <span className="display fs-3">{n}</span><small className="fw-bold text-muted">{t}</small>
            </div>
          </Col>
        ))}
      </Row>

      {turnoCreado && !aviso && <Alert variant="success">Turno reservado.</Alert>}
      {aviso && <Alert variant={aviso.tipo} dismissible onClose={() => setAviso(null)}>{aviso.texto}</Alert>}

      <Row className="g-4 mb-4">
        <Col lg={7} xl={8}>
          <section className="card-sgi">
            {turnos.loading && <Cargando />}
            {turnos.error && <ErrorCarga mensaje={turnos.error} />}
            {turnos.data && (lista.length === 0 ? <Vacio>{filtro ? 'Ningún turno con ese estado.' : 'No hay turnos para este día.'}</Vacio> : lista.map((t) => (
              <button key={t.id} type="button" className={`fila${elegido?.id === t.id ? ' activa' : ''}`} onClick={() => setElegidoId(t.id)} aria-pressed={elegido?.id === t.id}>
                <span className="hora-box">{t.hora}</span>
                <div className="flex-grow-1">
                  <div className="fila-titulo">{t.cliente.nombre}</div>
                  <div className="fila-sub">{t.vehiculo ? `${t.vehiculo.marca} ${t.vehiculo.modelo} · ${mostrarPatente(t.vehiculo.patente)}` : 'Sin vehículo'}</div>
                </div>
                <div className="d-none d-md-block small" style={{ minWidth: 150 }}>{nombresServicios(t)}</div>
                <EstadoTurnoBadge estado={t.estado} />
                <FiChevronRight className="text-muted" />
              </button>
            )))}
          </section>
        </Col>
        <Col lg={5} xl={4}>
          {elegido ? (
            <DetalleTurno
              key={elegido.id}
              turno={elegido}
              onEstado={(e) => cambiarEstado(elegido, e)}
              onRecordatorio={() => recordatorio(elegido)}
              onReprogramado={(texto) => { setAviso({ tipo: 'success', texto }); turnos.recargar(); }}
              onError={(texto) => setAviso({ tipo: 'danger', texto })}
            />
          ) : (
            <div className="card-sgi"><Vacio>Elegí un turno para ver el detalle.</Vacio></div>
          )}
        </Col>
      </Row>

      <section className="card-sgi">
        <div className="card-sgi-header">
          <div><h5>Ingresos al lavadero sin turno</h5><small className="text-muted">Total del día: {pesos(totalLavados)}</small></div>
          <Link to="/lavados/nuevo" className="btn-sgi btn-sm-sgi"><FiPlus /> Registrar ingreso</Link>
        </div>
        {lavados.loading && <Cargando />}
        {lavados.data && (lavados.data.length === 0 ? <Vacio>Todavía no entró ningún auto sin turno.</Vacio> : lavados.data.map((l) => (
          <div key={l.id} className="fila">
            <span className="hora-box">{horaDe(l.fecha)}</span>
            <div className="flex-grow-1">
              <div className="fila-titulo">{l.servicio.nombre} <span className="ms-2"><Patente patente={l.vehiculo.patente} /></span></div>
              <div className="fila-sub">{l.vehiculo.cliente.nombre} · atendió {l.empleado.nombre}{l.observaciones ? ` · ${l.observaciones}` : ''}</div>
            </div>
            <strong>{pesos(l.precio)}</strong>
            {tieneRol('ADMIN') && <button type="button" className="btn-sgi-ghost" onClick={() => anularLavado(l)}>Anular</button>}
          </div>
        )))}
      </section>
    </div>
  );
}

function DetalleTurno({ turno: t, onEstado, onRecordatorio, onReprogramado, onError }: {
  turno: TurnoConDetalle;
  onEstado: (e: EstadoTurno) => void;
  onRecordatorio: () => void;
  onReprogramado: (texto: string) => void;
  onError: (texto: string) => void;
}) {
  const [reprogramando, setReprogramando] = useState(false);
  const [fecha, setFecha] = useState(t.fecha);
  const [hora, setHora] = useState('');
  const disp = useFetch<Disponibilidad>(reprogramando && fecha ? `/turnos/disponibles?fecha=${fecha}` : null);
  const ahora = fecha === hoyAR() ? horaActualAR() : null;
  const libres = (disp.data?.libres ?? []).filter((h) => !ahora || h > ahora);
  const activo = t.estado !== 'CANCELADO' && t.estado !== 'COMPLETADO';

  const guardar = async () => {
    try {
      await apiFetch(`/turnos/${t.id}`, { method: 'PUT', body: JSON.stringify({ fecha, hora }) });
      onReprogramado(`Turno reprogramado para el ${fechaCorta(fecha)} a las ${hora}.`);
    } catch (err) {
      onError(mensajeDeError(err));
    }
  };

  return (
    <aside className="card-sgi" style={{ position: 'sticky', top: 90 }}>
      <div className="card-sgi-body">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <span className="eyebrow" style={{ color: 'var(--primary)' }}>TURNO #{t.id}</span>
          <EstadoTurnoBadge estado={t.estado} />
        </div>
        <h3 className="mb-1" style={{ fontSize: '1.6rem' }}>{t.cliente.nombre}</h3>
        <div className="text-muted small mb-3">{fechaCorta(t.fecha)} · {t.hora} hs</div>

        <ul className="list-unstyled d-flex flex-column gap-3 border-top pt-3 mb-3">
          <li className="d-flex gap-3"><span className="icon-circle"><FiUser /></span><div><div className="eyebrow d-block mb-0">CLIENTE</div><div className="fw-bold">
            <Link to={`/clientes/${t.cliente.id}`} className="text-reset">{t.cliente.nombre}</Link>{t.cliente.dni ? ` · DNI ${t.cliente.dni}` : ''}</div>
            <div className="fila-sub">{t.cliente.email ?? 'Sin e-mail'} · {t.cliente.telefono}</div></div></li>
          <li className="d-flex gap-3"><span className="icon-circle"><BsCarFront /></span><div><div className="eyebrow d-block mb-0">VEHÍCULO</div>
            {t.vehiculo ? (<><Link to={`/vehiculos/${t.vehiculo.id}`} className="fw-bold text-reset">{t.vehiculo.marca} {t.vehiculo.modelo}</Link>
              <div className="fila-sub">{mostrarPatente(t.vehiculo.patente)} · {t.vehiculo.km.toLocaleString('es-AR')} km</div></>) : <div className="fila-sub">Sin vehículo cargado</div>}</div></li>
          <li className="d-flex gap-3"><span className="icon-circle"><FiTool /></span><div><div className="eyebrow d-block mb-0">{t.servicios.length > 1 ? 'SERVICIOS' : 'SERVICIO'}</div><div className="fw-bold">{nombresServicios(t)}</div>
            <div className="fila-sub">{pesos(totalServicios(t))}</div></div></li>
          {t.nota && <li className="d-flex gap-3"><span className="icon-circle"><FiMessageSquare /></span><div><div className="eyebrow d-block mb-0">NOTA DEL CLIENTE</div><div className="fw-bold">{t.nota}</div></div></li>}
        </ul>

        <div className="border-top pt-3">
          <h5 className="display fs-5 mb-2">Cambiar estado</h5>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {(['CONFIRMADO', 'EN_PROCESO', 'COMPLETADO'] as EstadoTurno[]).map((e) => (
              <button key={e} type="button" disabled={t.estado === e}
                className={e === 'COMPLETADO' ? 'btn-sgi-teal btn-sm-sgi' : 'btn-sgi-outline btn-sm-sgi'} onClick={() => onEstado(e)}>
                {e === 'EN_PROCESO' ? 'En taller' : TEXTO_ESTADO_TURNO[e]}
              </button>
            ))}
            {t.estado !== 'CANCELADO' && t.estado !== 'COMPLETADO' && (
              <button type="button" className="btn-sgi-ghost btn-sgi-danger" onClick={() => window.confirm('¿Cancelar este turno?') && onEstado('CANCELADO')}>Cancelar</button>
            )}
            {(t.estado === 'CANCELADO' || t.estado === 'COMPLETADO') && (
              <button type="button" className="btn-sgi-ghost" onClick={() => onEstado('PENDIENTE')}>Volver a pendiente</button>
            )}
          </div>
          {t.estado === 'COMPLETADO' && <p className="small text-muted mb-3">Al completarlo se descontaron los insumos de {t.servicios.length > 1 ? 'los servicios' : 'el servicio'}{t.servicios.some((s) => s.servicio.tipo === 'lubricentro') ? ' y quedó registrado el service del vehículo' : ''}.</p>}

          {activo && (
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn-sgi-outline btn-sm-sgi" onClick={() => setReprogramando((v) => !v)}><FiClock /> Reprogramar</button>
              <button type="button" className="btn-sgi-outline btn-sm-sgi" onClick={onRecordatorio} disabled={!t.cliente.email}
                title={t.cliente.email ? undefined : 'El cliente no tiene e-mail'}>
                <FiSend /> {t.recordatorioEnviado ? 'Reenviar recordatorio' : 'Enviar recordatorio'}
              </button>
            </div>
          )}

          {reprogramando && (
            <div className="mt-3 p-3 rounded-3" style={{ background: 'var(--surface-2)' }}>
              <Form.Group className="mb-2" controlId={`rep-fecha-${t.id}`}>
                <Form.Label>Nuevo día</Form.Label>
                <Form.Control type="date" min={hoyAR()} value={fecha} onChange={(e) => { setFecha(e.target.value); setHora(''); }} />
              </Form.Group>
              <Form.Group className="mb-3" controlId={`rep-hora-${t.id}`}>
                <Form.Label>Horario libre</Form.Label>
                <Form.Select value={hora} onChange={(e) => setHora(e.target.value)} disabled={disp.loading}>
                  <option value="">{disp.loading ? 'Buscando...' : libres.length ? 'Elegí un horario' : 'Sin horarios libres'}</option>
                  {libres.map((h) => <option key={h} value={h}>{h}</option>)}
                </Form.Select>
              </Form.Group>
              <button type="button" className="btn-sgi w-100" disabled={!hora} onClick={guardar}>Guardar nuevo horario</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
