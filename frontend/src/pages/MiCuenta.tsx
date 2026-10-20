import { useState } from 'react';
import { Container, Row, Col, Table, Alert, Modal, Form } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiEdit2, FiPlus } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { EstadoTurnoBadge, Patente, ServiceBadge } from '../components/Badges';
import { BotonGuardar } from '../components/Formulario';
import { clienteDatosSchema, vehiculoCamposSchema } from '../schemas/clienteSchema';
import { fechaCorta, fechaLarga, km, mensajeDeError } from '../utils/formato';
import type { ClienteDetalle } from '../types/cliente';

/** Portal del cliente: sus datos, sus autos con el próximo service y sus turnos. */
export function MiCuenta() {
  const location = useLocation();
  const turnoCreado = (location.state as { turnoCreado?: number } | null)?.turnoCreado;
  const { data: ficha, loading, error, recargar } = useFetch<ClienteDetalle>('/clientes/mio');
  const [modal, setModal] = useState<'datos' | 'auto' | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

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
  if (error) return <Container className="py-5"><ErrorCarga mensaje={error} /></Container>;
  if (!ficha) return null;

  // La API los manda del más nuevo al más viejo: los próximos se muestran del más cercano al más lejano
  const proximos = ficha.turnos
    .filter((t) => t.estado !== 'COMPLETADO' && t.estado !== 'CANCELADO')
    .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
  const historial = ficha.turnos.filter((t) => t.estado === 'COMPLETADO' || t.estado === 'CANCELADO');

  return (
    <Container className="py-5 text-start">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="fw-bold m-0">Hola, {ficha.nombre.split(' ')[0]}</h2>
        <Link to="/turnos/nuevo" className="btn-primary-custom text-decoration-none">Reservar turno</Link>
      </div>

      {turnoCreado && <Alert variant="success">Turno reservado. Te esperamos.</Alert>}
      {errorAccion && <Alert variant="danger" dismissible onClose={() => setErrorAccion(null)}>{errorAccion}</Alert>}

      <Row className="g-4">
        <Col lg={4} className="d-flex flex-column gap-4">
          <section className="saas-card-dark p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Mis datos</h5>
              <button type="button" className="btn-action-dark" onClick={() => setModal('datos')}><FiEdit2 /> Editar</button>
            </div>
            <dl className="mb-0 small">
              <dt className="text-muted fw-normal">Nombre</dt><dd>{ficha.nombre}</dd>
              <dt className="text-muted fw-normal">Teléfono</dt><dd>{ficha.telefono}</dd>
              <dt className="text-muted fw-normal">Email</dt><dd>{ficha.email}</dd>
              <dt className="text-muted fw-normal">Cliente desde</dt><dd className="mb-0">{fechaLarga(ficha.createdAt)}</dd>
            </dl>
          </section>

          <section className="saas-card-dark p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Mis autos</h5>
              <button type="button" className="btn-action-dark" onClick={() => setModal('auto')}><FiPlus /> Agregar</button>
            </div>
            {ficha.vehiculos.length === 0 && <Vacio>Todavía no cargaste ningún auto.</Vacio>}
            <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
              {ficha.vehiculos.map((v) => (
                <li key={v.id} className="border-bottom border-secondary pb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">{v.marca} {v.modelo}</span>
                    <Patente patente={v.patente} />
                  </div>
                  <div className="small text-muted mb-2">{km(v.km)}{v.anio ? ` · ${v.anio}` : ''}</div>
                  <ServiceBadge service={v.service} detalle />
                </li>
              ))}
            </ul>
          </section>
        </Col>

        <Col lg={8} className="d-flex flex-column gap-4">
          <section className="saas-card-dark p-0">
            <h5 className="fw-bold m-0 p-4 border-bottom border-secondary">Próximos turnos</h5>
            {proximos.length === 0 ? (
              <Vacio>No tenés turnos reservados.</Vacio>
            ) : (
              <Table responsive variant="dark" className="mb-0 align-middle">
                <thead><tr><th>Día</th><th>Hora</th><th>Servicio</th><th>Auto</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {proximos.map((t) => (
                    <tr key={t.id}>
                      <td>{fechaCorta(t.fecha)}</td>
                      <td className="fw-bold">{t.hora}</td>
                      <td>{t.servicio.nombre}</td>
                      <td>{t.vehiculo ? <Patente patente={t.vehiculo.patente} /> : '—'}</td>
                      <td><EstadoTurnoBadge estado={t.estado} /></td>
                      <td className="text-end">
                        {(t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO') && (
                          <button type="button" className="btn-action-dark" onClick={() => cancelar(t.id)}>Cancelar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </section>

          <section className="saas-card-dark p-0">
            <h5 className="fw-bold m-0 p-4 border-bottom border-secondary">Historial</h5>
            {historial.length === 0 ? (
              <Vacio>Acá vas a ver los servicios que te hicimos.</Vacio>
            ) : (
              <Table responsive variant="dark" className="mb-0 align-middle">
                <thead><tr><th>Día</th><th>Servicio</th><th>Auto</th><th>Estado</th></tr></thead>
                <tbody>
                  {historial.map((t) => (
                    <tr key={t.id}>
                      <td>{fechaCorta(t.fecha)}</td>
                      <td>{t.servicio.nombre}</td>
                      <td>{t.vehiculo ? <Patente patente={t.vehiculo.patente} /> : '—'}</td>
                      <td><EstadoTurnoBadge estado={t.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </section>
        </Col>
      </Row>

      <EditarDatosModal
        mostrar={modal === 'datos'}
        ficha={ficha}
        onCerrar={() => setModal(null)}
        onGuardado={() => { setModal(null); recargar(); }}
      />
      <AgregarAutoModal
        mostrar={modal === 'auto'}
        onCerrar={() => setModal(null)}
        onGuardado={() => { setModal(null); recargar(); }}
      />
    </Container>
  );
}

type ModalProps = { mostrar: boolean; onCerrar: () => void; onGuardado: () => void };

function EditarDatosModal({ mostrar, ficha, onCerrar, onGuardado }: ModalProps & { ficha: ClienteDetalle }) {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(clienteDatosSchema.pick({ nombre: true, telefono: true })),
    values: { nombre: ficha.nombre, telefono: ficha.telefono },
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
          <Form.Group controlId="mc-telefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control {...register('telefono')} isInvalid={!!errors.telefono} />
            <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer><BotonGuardar guardando={isSubmitting} texto="Guardar cambios" /></Modal.Footer>
      </Form>
    </Modal>
  );
}

function AgregarAutoModal({ mostrar, onCerrar, onGuardado }: ModalProps) {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(vehiculoCamposSchema),
    defaultValues: { patente: '', marca: '', modelo: '', anio: '', km: '' },
  });

  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    try {
      // Sin clienteId: la API lo carga a nombre de la ficha del cliente logueado
      await apiFetch('/vehiculos', { method: 'POST', body: JSON.stringify(datos) });
      reset();
      onGuardado();
    } catch (err) {
      setErrorApi(mensajeDeError(err));
    }
  });

  return (
    <Modal show={mostrar} onHide={onCerrar} centered>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton><Modal.Title>Agregar un auto</Modal.Title></Modal.Header>
        <Modal.Body>
          {errorApi && <Alert variant="danger">{errorApi}</Alert>}
          <Row className="g-3">
            <Col sm={6}>
              <Form.Group controlId="aa-patente">
                <Form.Label>Patente</Form.Label>
                <Form.Control {...register('patente')} isInvalid={!!errors.patente} placeholder="AB 123 CD" />
                <Form.Control.Feedback type="invalid">{errors.patente?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="aa-km">
                <Form.Label>Km actuales</Form.Label>
                <Form.Control inputMode="numeric" {...register('km')} isInvalid={!!errors.km} />
                <Form.Control.Feedback type="invalid">{errors.km?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="aa-marca">
                <Form.Label>Marca</Form.Label>
                <Form.Control {...register('marca')} isInvalid={!!errors.marca} />
                <Form.Control.Feedback type="invalid">{errors.marca?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="aa-modelo">
                <Form.Label>Modelo</Form.Label>
                <Form.Control {...register('modelo')} isInvalid={!!errors.modelo} />
                <Form.Control.Feedback type="invalid">{errors.modelo?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><BotonGuardar guardando={isSubmitting} texto="Agregar auto" /></Modal.Footer>
      </Form>
    </Modal>
  );
}
