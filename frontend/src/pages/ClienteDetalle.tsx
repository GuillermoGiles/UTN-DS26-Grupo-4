import { useState } from 'react';
import { Row, Col, Table, Alert, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiEdit2, FiPlus } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { EstadoTurnoBadge, Patente, ServiceBadge } from '../components/Badges';
import { BotonGuardar } from '../components/Formulario';
import { clienteDatosSchema } from '../schemas/clienteSchema';
import { fechaCorta, fechaLarga, km, mensajeDeError } from '../utils/formato';
import type { ClienteDetalle as Ficha } from '../types/cliente';

/** Ficha de un cliente para el personal: datos editables, sus autos y su historial de turnos. */
export function ClienteDetalle() {
  const { id } = useParams();
  const { data: ficha, loading, error, recargar } = useFetch<Ficha>(`/clientes/${id}`);
  const [editando, setEditando] = useState(false);

  if (loading && !ficha) return <Cargando />;
  if (error) return <div className="page"><ErrorCarga mensaje={error} /></div>;
  if (!ficha) return null;

  return (
    <div className="page">
      <p className="mb-2"><Link to="/clientes">← Clientes</Link></p>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="fw-bold m-0">{ficha.nombre}</h2>
        <Link to={`/turnos/nuevo?cliente=${ficha.id}`} className="btn-sgi text-decoration-none">Reservar turno</Link>
      </div>

      <Row className="g-4">
        <Col lg={4} className="d-flex flex-column gap-4">
          <section className="card-sgi p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Datos</h5>
              {!editando && <button type="button" className="btn-sgi-ghost" onClick={() => setEditando(true)}><FiEdit2 /> Editar</button>}
            </div>
            {editando ? (
              <EditarCliente ficha={ficha} onListo={() => { setEditando(false); recargar(); }} onCancelar={() => setEditando(false)} />
            ) : (
              <dl className="mb-0 small">
                <dt className="text-muted fw-normal">DNI</dt><dd>{ficha.dni ?? '—'}</dd>
                <dt className="text-muted fw-normal">Teléfono</dt><dd>{ficha.telefono}</dd>
                <dt className="text-muted fw-normal">Email</dt><dd>{ficha.email ?? '—'}</dd>
                <dt className="text-muted fw-normal">Cuenta web</dt><dd>{ficha.usuarioId ? 'Registrado' : 'Sin cuenta'}</dd>
                <dt className="text-muted fw-normal">Cliente desde</dt><dd className="mb-0">{fechaLarga(ficha.createdAt)}</dd>
              </dl>
            )}
          </section>

          <section className="card-sgi p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Vehículos</h5>
              <Link to={`/vehiculos/nuevo?cliente=${ficha.id}`} className="btn-sgi-ghost"><FiPlus /> Agregar</Link>
            </div>
            {ficha.vehiculos.length === 0 && <Vacio>Sin vehículos cargados.</Vacio>}
            <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
              {ficha.vehiculos.map((v) => (
                <li key={v.id} className="border-bottom  pb-3">
                  <Link to={`/vehiculos/${v.id}`} className="d-flex justify-content-between align-items-center mb-1 text-decoration-none">
                    <span className="fw-bold">{v.marca} {v.modelo}</span>
                    <Patente patente={v.patente} />
                  </Link>
                  <div className="small text-muted mb-2">{km(v.km)}</div>
                  <ServiceBadge service={v.service} detalle />
                </li>
              ))}
            </ul>
          </section>
        </Col>

        <Col lg={8}>
          <section className="card-sgi p-0">
            <h5 className="fw-bold m-0 p-4 border-bottom ">Turnos</h5>
            {ficha.turnos.length === 0 ? <Vacio>Sin turnos todavía.</Vacio> : (
              <Table responsive className="table-sgi mb-0 align-middle">
                <thead><tr><th>Día</th><th>Hora</th><th>Servicio</th><th>Vehículo</th><th>Estado</th></tr></thead>
                <tbody>
                  {ficha.turnos.map((t) => (
                    <tr key={t.id}>
                      <td><Link to={`/agenda?fecha=${t.fecha}`} className="text-reset fw-bold">{fechaCorta(t.fecha)}</Link></td>
                      <td>{t.hora}</td>
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
    </div>
  );
}

function EditarCliente({ ficha, onListo, onCancelar }: { ficha: Ficha; onListo: () => void; onCancelar: () => void }) {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(clienteDatosSchema),
    defaultValues: { nombre: ficha.nombre, telefono: ficha.telefono, email: ficha.email ?? '', dni: ficha.dni ?? '' },
  });

  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    try {
      await apiFetch(`/clientes/${ficha.id}`, { method: 'PUT', body: JSON.stringify(datos) });
      onListo();
    } catch (err) {
      setErrorApi(mensajeDeError(err));
    }
  });

  return (
    <Form onSubmit={onSubmit} noValidate>
      {errorApi && <Alert variant="danger">{errorApi}</Alert>}
      <Form.Group className="mb-2" controlId="ed-nombre">
        <Form.Label>Nombre</Form.Label>
        <Form.Control {...register('nombre')} isInvalid={!!errors.nombre} />
        <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-2" controlId="ed-telefono">
        <Form.Label>Teléfono</Form.Label>
        <Form.Control {...register('telefono')} isInvalid={!!errors.telefono} />
        <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-2" controlId="ed-dni">
        <Form.Label>DNI</Form.Label>
        <Form.Control inputMode="numeric" {...register('dni')} isInvalid={!!errors.dni} />
        <Form.Control.Feedback type="invalid">{errors.dni?.message}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="ed-email">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" {...register('email')} isInvalid={!!errors.email} />
        <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
      </Form.Group>
      <div className="d-flex gap-2">
        <BotonGuardar guardando={isSubmitting} texto="Guardar" />
        <button type="button" className="btn-sgi-outline w-100" onClick={onCancelar}>Cancelar</button>
      </div>
    </Form>
  );
}
