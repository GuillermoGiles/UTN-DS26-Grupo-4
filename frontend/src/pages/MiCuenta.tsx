import { useState } from 'react';
import { Row, Col, Alert, Modal, Form } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiCalendar, FiEdit2, FiPlus, FiTool, FiTrash2 } from 'react-icons/fi';
import { BsCarFront, BsSpeedometer2 } from 'react-icons/bs';
import { useFetch } from '../hooks/useFetch';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { BotonGuardar, EncabezadoPagina } from '../components/Formulario';
import { EstadoTurnoBadge, Patente, ServiceBadge } from '../components/Badges';
import { clienteDatosSchema } from '../schemas/clienteSchema';
import { AgregarAutoModal } from '../components/AgregarAutoModal';
import { fechaCorta, fechaLarga, km, mensajeDeError, mostrarPatente, pesos } from '../utils/formato';
import type { ClienteDetalle } from '../types/cliente';
import { nombresServicios, totalServicios } from '../types/turno';

/** Portal del cliente: sus turnos, el historial de servicios y sus autos con el próximo service. */
export function MiCuenta() {
  const location = useLocation();
  const turnoCreado = (location.state as { turnoCreado?: number } | null)?.turnoCreado;
  const { data: ficha, loading, error, recargar } = useFetch<ClienteDetalle>('/clientes/mio');
  const [modal, setModal] = useState<'datos' | 'auto' | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  // Auto del que se muestran las estadísticas (null = el de service más urgente)
  const [autoElegidoId, setAutoElegidoId] = useState<number | null>(null);

  const eliminarAuto = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Eliminar ${nombre} de tus autos?`)) return;
    setErrorAccion(null);
    try {
      await apiFetch(`/vehiculos/${id}`, { method: 'DELETE' });
      if (autoElegidoId === id) setAutoElegidoId(null);
      recargar();
    } catch (err) {
      setErrorAccion(mensajeDeError(err)); // 409 si tiene turnos reservados o lavados registrados
    }
  };

  const cancelar = async (id: number) => {
    if (!window.confirm('¿Cancelar este turno?')) return;
    setErrorAccion(null);
    try {
      await apiFetch(`/turnos/${id}/cancelar`, { method: 'PATCH' });
      recargar();
    } catch (err) {
      setErrorAccion(mensajeDeError(err));
    }
  };

  if (loading && !ficha) return <Cargando />;
  if (error) return <div className="page"><ErrorCarga mensaje={error} /></div>;
  if (!ficha) return null;

  // La API los manda del más nuevo al más viejo: los próximos se muestran del más cercano al más lejano
  const proximos = ficha.turnos
    .filter((t) => t.estado !== 'COMPLETADO' && t.estado !== 'CANCELADO')
    .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
  const historial = ficha.turnos.filter((t) => t.estado === 'COMPLETADO' || t.estado === 'CANCELADO');
  // Por defecto se muestra el auto con el service más urgente; el cliente puede elegir otro
  const orden = { vencido: 0, proximo: 1, ok: 2, 'sin-datos': 3 } as const;
  const masUrgente = [...ficha.vehiculos].sort((a, b) => orden[a.service.estado] - orden[b.service.estado])[0];
  const autoPrincipal = ficha.vehiculos.find((v) => v.id === autoElegidoId) ?? masUrgente;
  // Las estadísticas son del auto elegido (sin autos cargados, las de todos sus turnos)
  const completados = historial.filter((t) => t.estado === 'COMPLETADO' && (!autoPrincipal || t.vehiculoId === autoPrincipal.id));
  const ultima = completados[0];

  const indicadores = [
    { icono: <FiTool />, etiqueta: 'SERVICIOS REALIZADOS', valor: String(completados.length), nota: `Cliente desde ${fechaLarga(ficha.createdAt)}` },
    { icono: <FiCalendar />, etiqueta: 'ÚLTIMA VISITA', valor: ultima ? fechaCorta(ultima.fecha) : '—', nota: ultima ? nombresServicios(ultima) : 'Todavía no viniste' },
    {
      icono: <BsSpeedometer2 />, etiqueta: 'PRÓXIMO SERVICE',
      valor: autoPrincipal?.service.proximoKm ? km(autoPrincipal.service.proximoKm) : '—',
      nota: autoPrincipal?.service.proximaFecha ? `o antes del ${fechaLarga(autoPrincipal.service.proximaFecha)}` : 'Sin service registrado',
    },
  ];

  return (
    <div className="page">
      <EncabezadoPagina
        eyebrow="MI CUENTA"
        titulo={`Hola, ${ficha.nombre.split(' ')[0]}`}
        texto="Tus turnos, el historial de servicios y cuándo le toca el próximo service a cada auto."
        acciones={<Link to="/turnos/nuevo" className="btn-sgi"><FiPlus /> Reservar turno</Link>}
      />
      {turnoCreado && <Alert variant="success">Turno reservado. Te esperamos.</Alert>}
      {errorAccion && <Alert variant="danger" dismissible onClose={() => setErrorAccion(null)}>{errorAccion}</Alert>}

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <div className="card-sgi p-3 d-flex gap-3 align-items-center h-100">
            <span className="icon-circle"><BsCarFront /></span>
            <div className="lh-sm flex-grow-1" style={{ minWidth: 0 }}>
              <label htmlFor="auto-principal" className="fw-bold text-muted d-block" style={{ fontSize: '.7rem', letterSpacing: '.06em' }}>AUTO PRINCIPAL</label>
              {ficha.vehiculos.length === 0 ? (
                <><div className="display fs-4">—</div><small className="text-muted">Cargá tu auto</small></>
              ) : (
                <>
                  <Form.Select id="auto-principal" size="sm" className="fw-bold my-1" value={autoPrincipal?.id ?? ''}
                    onChange={(e) => setAutoElegidoId(Number(e.target.value))}>
                    {ficha.vehiculos.map((v) => <option key={v.id} value={v.id}>{mostrarPatente(v.patente)}</option>)}
                  </Form.Select>
                  <small className="text-muted">{autoPrincipal ? `${autoPrincipal.marca} ${autoPrincipal.modelo}` : ''}</small>
                </>
              )}
            </div>
          </div>
        </Col>
        {indicadores.map((i) => (
          <Col key={i.etiqueta} sm={6} xl={3}>
            <div className="card-sgi p-3 d-flex gap-3 align-items-center h-100">
              <span className="icon-circle">{i.icono}</span>
              <div className="lh-sm">
                <div className="fw-bold text-muted" style={{ fontSize: '.7rem', letterSpacing: '.06em' }}>{i.etiqueta}</div>
                <div className="display fs-4">{i.valor}</div>
                <small className="text-muted">{i.nota}</small>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={8} className="d-flex flex-column gap-4">
          <section className="card-sgi">
            <div className="card-sgi-header"><h5>Próximos turnos</h5></div>
            {proximos.length === 0 ? <Vacio>No tenés turnos reservados.</Vacio> : proximos.map((t) => (
              <div key={t.id} className="fila">
                <span className="hora-box">{t.hora}</span>
                <div className="flex-grow-1">
                  <div className="fila-titulo">{nombresServicios(t)}</div>
                  <div className="fila-sub">{fechaCorta(t.fecha)}{t.vehiculo ? ` · ${t.vehiculo.marca} ${t.vehiculo.modelo} · ${mostrarPatente(t.vehiculo.patente)}` : ''}</div>
                </div>
                <EstadoTurnoBadge estado={t.estado} />
                {(t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO') && (
                  <button type="button" className="btn-sgi-ghost" onClick={() => cancelar(t.id)}>Cancelar</button>
                )}
              </div>
            ))}
          </section>

          <section className="card-sgi">
            <div className="card-sgi-header"><h5>Historial de servicios</h5><small className="text-muted">{historial.length} registros</small></div>
            {historial.length === 0 ? <Vacio>Acá vas a ver los trabajos que te hicimos.</Vacio> : historial.map((t) => (
              <div key={t.id} className="fila">
                <div style={{ minWidth: 90 }}>
                  <div className="fw-bold small" style={{ color: 'var(--primary)' }}>{fechaCorta(t.fecha).toUpperCase()}</div>
                  <small className="text-muted">{t.hora} hs</small>
                </div>
                <div className="flex-grow-1">
                  <div className="fila-titulo display fs-6">{nombresServicios(t)} <span className="ms-1"><EstadoTurnoBadge estado={t.estado} /></span></div>
                  <div className="fila-sub">{t.vehiculo ? `${t.vehiculo.marca} ${t.vehiculo.modelo} · ${mostrarPatente(t.vehiculo.patente)}` : 'Sin vehículo'}</div>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block" style={{ fontSize: '.68rem', letterSpacing: '.06em' }}>PRECIO</small>
                  <strong className="display fs-5">{pesos(totalServicios(t))}</strong>
                </div>
              </div>
            ))}
          </section>
        </Col>

        <Col lg={4} className="d-flex flex-column gap-4">
          <section className="card-sgi">
            <div className="card-sgi-header">
              <h5>Mis autos</h5>
              <button type="button" className="btn-sgi-ghost" onClick={() => setModal('auto')}><FiPlus /> Agregar</button>
            </div>
            {ficha.vehiculos.length === 0 ? <Vacio>Todavía no cargaste ningún auto.</Vacio> : ficha.vehiculos.map((v) => (
              <div key={v.id} className="fila flex-column align-items-start gap-2"
                style={v.id === autoPrincipal?.id && ficha.vehiculos.length > 1 ? { background: 'var(--teal-soft)' } : undefined}>
                <div className="d-flex justify-content-between w-100 align-items-center gap-2">
                  <span className="fila-titulo">{v.marca} {v.modelo}</span>
                  <span className="d-flex align-items-center gap-2">
                    <Patente patente={v.patente} />
                    <button type="button" className="btn-sgi-ghost px-2" onClick={() => eliminarAuto(v.id, `${v.marca} ${v.modelo}`)}
                      aria-label={`Eliminar ${v.marca} ${v.modelo}`} title="Eliminar auto"><FiTrash2 /></button>
                  </span>
                </div>
                <div className="fila-sub">{km(v.km)}{v.anio ? ` · ${v.anio}` : ''}</div>
                <ServiceBadge service={v.service} detalle />
              </div>
            ))}
          </section>

          <section className="card-sgi">
            <div className="card-sgi-header">
              <h5>Mis datos</h5>
              <button type="button" className="btn-sgi-ghost" onClick={() => setModal('datos')}><FiEdit2 /> Editar</button>
            </div>
            <dl className="card-sgi-body mb-0 small">
              <dt className="text-muted fw-normal">Nombre</dt><dd>{ficha.nombre}</dd>
              <dt className="text-muted fw-normal">DNI</dt><dd>{ficha.dni ?? '—'}</dd>
              <dt className="text-muted fw-normal">Teléfono</dt><dd>{ficha.telefono}</dd>
              <dt className="text-muted fw-normal">Email</dt><dd className="mb-0">{ficha.email}</dd>
            </dl>
          </section>
        </Col>
      </Row>

      <EditarDatosModal mostrar={modal === 'datos'} ficha={ficha} onCerrar={() => setModal(null)} onGuardado={() => { setModal(null); recargar(); }} />
      <AgregarAutoModal mostrar={modal === 'auto'} onCerrar={() => setModal(null)} onGuardado={(v) => { setModal(null); setAutoElegidoId(v.id); recargar(); }} />
    </div>
  );
}

type ModalProps = { mostrar: boolean; onCerrar: () => void; onGuardado: () => void };

function EditarDatosModal({ mostrar, ficha, onCerrar, onGuardado }: ModalProps & { ficha: ClienteDetalle }) {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(clienteDatosSchema.pick({ nombre: true, telefono: true, dni: true })),
    values: { nombre: ficha.nombre, telefono: ficha.telefono, dni: ficha.dni ?? '' },
  });

  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    try {
      await apiFetch('/clientes/mio', { method: 'PUT', body: JSON.stringify(datos) });
      onGuardado();
    } catch (err) {
      setErrorApi(mensajeDeError(err));
    }
  });

  return (
    <Modal show={mostrar} onHide={onCerrar} centered>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton><Modal.Title>Editar mis datos</Modal.Title></Modal.Header>
        <Modal.Body>
          {errorApi && <Alert variant="danger">{errorApi}</Alert>}
          <Form.Group className="mb-3" controlId="mc-nombre">
            <Form.Label>Nombre y apellido</Form.Label>
            <Form.Control {...register('nombre')} isInvalid={!!errors.nombre} />
            <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="mc-telefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control {...register('telefono')} isInvalid={!!errors.telefono} />
            <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="mc-dni">
            <Form.Label>DNI</Form.Label>
            <Form.Control inputMode="numeric" {...register('dni')} isInvalid={!!errors.dni} />
            <Form.Control.Feedback type="invalid">{errors.dni?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer><BotonGuardar guardando={isSubmitting} texto="Guardar cambios" /></Modal.Footer>
      </Form>
    </Modal>
  );
}
