import { useState } from 'react';
import { Container, Table, Form, Alert, Row, Col } from 'react-bootstrap';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { EstadoTurnoBadge, Patente } from '../components/Badges';
import { TEXTO_ESTADO_TURNO } from '../utils/estados';
import { fechaCorta, hoyAR, horaDe, mensajeDeError, pesos, sumarDias } from '../utils/formato';
import { ESTADOS_TURNO, type EstadoTurno, type TurnoConDetalle } from '../types/turno';
import type { Lavado } from '../types/lavado';

/** Agenda operativa del día (wireframe 02): turnos con su estado y autos que entraron sin turno. */
export function Agenda() {
  const { tieneRol } = useAuth();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const fecha = params.get('fecha') ?? hoyAR();
  const turnoCreado = (location.state as { turnoCreado?: number } | null)?.turnoCreado;

  const turnos = useFetch<TurnoConDetalle[]>(`/turnos?fecha=${fecha}`);
  const lavados = useFetch<Lavado[]>(`/lavados?fecha=${fecha}`);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const irA = (nueva: string) => setParams(nueva === hoyAR() ? {} : { fecha: nueva });

  const accion = async (llamada: () => Promise<unknown>, recargar: () => void) => {
    setErrorAccion(null);
    try {
      await llamada();
      recargar();
    } catch (err) {
      setErrorAccion(mensajeDeError(err));
    }
  };

  const cambiarEstado = (t: TurnoConDetalle, estado: EstadoTurno) =>
    accion(() => apiFetch(`/turnos/${t.id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }), turnos.recargar);

  const anularLavado = (l: Lavado) => {
    if (!window.confirm(`¿Anular el lavado de ${l.vehiculo.patente}?`)) return;
    accion(() => apiFetch(`/lavados/${l.id}`, { method: 'DELETE' }), lavados.recargar);
  };

  const activos = (turnos.data ?? []).filter((t) => t.estado !== 'CANCELADO');
  const totalLavados = (lavados.data ?? []).reduce((s, l) => s + l.precio, 0);

  return (
    <Container className="py-5 text-start">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Agenda</h2>
          <p className="text-muted mb-0">
            {fecha === hoyAR() ? 'Hoy, ' : ''}{fechaCorta(fecha)} · {activos.length} turnos · {(lavados.data ?? []).length} lavados sin turno
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button type="button" className="btn-outline-custom py-1" onClick={() => irA(sumarDias(fecha, -1))} aria-label="Día anterior">‹</button>
          <Form.Control type="date" value={fecha} onChange={(e) => e.target.value && irA(e.target.value)} style={{ width: 170 }} aria-label="Fecha" />
          <button type="button" className="btn-outline-custom py-1" onClick={() => irA(sumarDias(fecha, 1))} aria-label="Día siguiente">›</button>
          {fecha !== hoyAR() && <button type="button" className="btn-outline-custom py-1" onClick={() => irA(hoyAR())}>Hoy</button>}
        </div>
      </div>

      {turnoCreado && <Alert variant="success">Turno reservado.</Alert>}
      {errorAccion && <Alert variant="danger" dismissible onClose={() => setErrorAccion(null)}>{errorAccion}</Alert>}

      <section className="saas-card-dark p-0 mb-4">
        <div className="p-4 border-bottom border-secondary d-flex justify-content-between align-items-center">
          <h5 className="m-0 fw-bold">Turnos</h5>
          <Link to={`/turnos/nuevo?fecha=${fecha}`} className="btn-primary-custom text-decoration-none d-flex align-items-center gap-2">
            <FiPlus /> Nuevo turno
          </Link>
        </div>
        {turnos.loading && <Cargando />}
        {turnos.error && <ErrorCarga mensaje={turnos.error} />}
        {turnos.data && (turnos.data.length === 0 ? (
          <Vacio>No hay turnos para este día.</Vacio>
        ) : (
          <Table responsive variant="dark" className="mb-0 align-middle">
            <thead>
              <tr><th>Hora</th><th>Cliente</th><th>Vehículo</th><th>Servicio</th><th>Estado</th><th style={{ minWidth: 170 }}>Cambiar a</th></tr>
            </thead>
            <tbody>
              {turnos.data.map((t) => (
                <tr key={t.id} style={t.estado === 'CANCELADO' ? { opacity: 0.5 } : undefined}>
                  <td className="fw-bold">{t.hora}</td>
                  <td>
                    <Link to={`/clientes/${t.cliente.id}`} className="text-white">{t.cliente.nombre}</Link>
                    <div className="small text-muted">{t.cliente.telefono}</div>
                  </td>
                  <td>
                    {t.vehiculo ? (
                      <Link to={`/vehiculos/${t.vehiculo.id}`} className="text-decoration-none">
                        <Patente patente={t.vehiculo.patente} />
                        <div className="small text-muted">{t.vehiculo.marca} {t.vehiculo.modelo}</div>
                      </Link>
                    ) : '—'}
                  </td>
                  <td>
                    {t.servicio.nombre}
                    {t.nota && <div className="small text-muted">“{t.nota}”</div>}
                  </td>
                  <td><EstadoTurnoBadge estado={t.estado} /></td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={t.estado}
                      onChange={(e) => cambiarEstado(t, e.target.value as EstadoTurno)}
                      aria-label={`Estado del turno de las ${t.hora}`}
                    >
                      {ESTADOS_TURNO.map((e) => <option key={e} value={e}>{TEXTO_ESTADO_TURNO[e]}</option>)}
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ))}
      </section>

      <section className="saas-card-dark p-0">
        <div className="p-4 border-bottom border-secondary d-flex justify-content-between align-items-center">
          <h5 className="m-0 fw-bold">Ingresos al lavadero sin turno</h5>
          <Link to="/lavados/nuevo" className="btn-primary-custom text-decoration-none d-flex align-items-center gap-2">
            <FiPlus /> Registrar ingreso
          </Link>
        </div>
        {lavados.loading && <Cargando />}
        {lavados.error && <ErrorCarga mensaje={lavados.error} />}
        {lavados.data && (lavados.data.length === 0 ? (
          <Vacio>Todavía no entró ningún auto sin turno.</Vacio>
        ) : (
          <>
            <Table responsive variant="dark" className="mb-0 align-middle">
              <thead><tr><th>Hora</th><th>Vehículo</th><th>Cliente</th><th>Lavado</th><th>Atendió</th><th className="text-end">Precio</th>{tieneRol('ADMIN') && <th></th>}</tr></thead>
              <tbody>
                {lavados.data.map((l) => (
                  <tr key={l.id}>
                    <td>{horaDe(l.fecha)}</td>
                    <td><Patente patente={l.vehiculo.patente} /></td>
                    <td>{l.vehiculo.cliente.nombre}</td>
                    <td>{l.servicio.nombre}{l.observaciones && <div className="small text-muted">{l.observaciones}</div>}</td>
                    <td>{l.empleado.nombre}</td>
                    <td className="text-end">{pesos(l.precio)}</td>
                    {tieneRol('ADMIN') && (
                      <td className="text-end"><button type="button" className="btn-action-dark" onClick={() => anularLavado(l)}>Anular</button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
            <Row className="p-3 m-0"><Col className="text-end text-muted">Total lavados: <strong className="text-white">{pesos(totalLavados)}</strong></Col></Row>
          </>
        ))}
      </section>
    </Container>
  );
}
