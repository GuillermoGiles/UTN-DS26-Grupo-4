import { useState } from 'react';
import { Row, Col, Table, Alert, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFetch } from '../hooks/useFetch';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { EstadoTurnoBadge, Patente, ServiceBadge } from '../components/Badges';
import { BotonGuardar } from '../components/Formulario';
import { registrarServiceSchema } from '../schemas/vehiculoSchema';
import { fechaCorta, fechaLarga, km, mensajeDeError, pesos } from '../utils/formato';
import type { VehiculoDetalle as Detalle } from '../types/vehiculo';
import { nombresServicios } from '../types/turno';

/** Historial del vehículo (wireframe 03, ficha técnica): service, turnos y lavados. */
export function VehiculoDetalle() {
  const { id } = useParams();
  const { data: v, loading, error, recargar } = useFetch<Detalle>(`/vehiculos/${id}`);
  const [ok, setOk] = useState(false);

  if (loading && !v) return <Cargando />;
  if (error) return <div className="page"><ErrorCarga mensaje={error} /></div>;
  if (!v) return null;

  return (
    <div className="page">
      <p className="mb-2"><Link to="/vehiculos">← Vehículos</Link></p>
      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <h2 className="fw-bold m-0">{v.marca} {v.modelo}</h2>
        <Patente patente={v.patente} />
      </div>
      {ok && <Alert variant="success" dismissible onClose={() => setOk(false)}>Service registrado.</Alert>}

      <Row className="g-4">
        <Col lg={4} className="d-flex flex-column gap-4">
          <section className="card-sgi p-4">
            <h5 className="fw-bold mb-3">Datos</h5>
            <dl className="small mb-0">
              <dt className="text-muted fw-normal">Titular</dt>
              <dd><Link to={`/clientes/${v.cliente.id}`} className="text-reset fw-bold">{v.cliente.nombre}</Link> · {v.cliente.telefono}</dd>
              <dt className="text-muted fw-normal">Año</dt><dd>{v.anio ?? '—'}</dd>
              <dt className="text-muted fw-normal">Kilometraje</dt><dd>{km(v.km)}</dd>
              <dt className="text-muted fw-normal">Último service</dt>
              <dd className="mb-0">
                {v.fechaUltimoService ? `${fechaLarga(v.fechaUltimoService)}${v.kmUltimoService !== null ? ` a los ${km(v.kmUltimoService)}` : ''}` : 'Sin registrar'}
              </dd>
            </dl>
          </section>

          <section className="card-sgi p-4">
            <h5 className="fw-bold mb-3">Service</h5>
            <div className="mb-3"><ServiceBadge service={v.service} detalle /></div>
            <RegistrarService vehiculoId={v.id} kmActual={v.km} onListo={() => { setOk(true); recargar(); }} />
          </section>
        </Col>

        <Col lg={8} className="d-flex flex-column gap-4">
          <section className="card-sgi p-0">
            <h5 className="fw-bold m-0 p-4 border-bottom ">Turnos</h5>
            {v.turnos.length === 0 ? <Vacio>Sin turnos.</Vacio> : (
              <Table responsive className="table-sgi mb-0 align-middle">
                <thead><tr><th>Día</th><th>Hora</th><th>Servicio</th><th>Estado</th></tr></thead>
                <tbody>
                  {v.turnos.map((t) => (
                    <tr key={t.id}>
                      <td>{fechaCorta(t.fecha)}</td><td>{t.hora}</td><td>{nombresServicios(t)}</td>
                      <td><EstadoTurnoBadge estado={t.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </section>
          <section className="card-sgi p-0">
            <h5 className="fw-bold m-0 p-4 border-bottom ">Lavados sin turno</h5>
            {v.lavados.length === 0 ? <Vacio>Sin lavados registrados.</Vacio> : (
              <Table responsive className="table-sgi mb-0 align-middle">
                <thead><tr><th>Fecha</th><th>Lavado</th><th>Atendió</th><th className="text-end">Precio</th></tr></thead>
                <tbody>
                  {v.lavados.map((l) => (
                    <tr key={l.id}>
                      <td>{fechaLarga(l.fecha)}</td><td>{l.servicio.nombre}</td><td>{l.empleado.nombre}</td>
                      <td className="text-end">{pesos(l.precio)}</td>
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

function RegistrarService({ vehiculoId, kmActual, onListo }: { vehiculoId: number; kmActual: number; onListo: () => void }) {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registrarServiceSchema),
    defaultValues: { km: String(kmActual) },
  });

  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    try {
      await apiFetch(`/vehiculos/${vehiculoId}/service`, { method: 'POST', body: JSON.stringify(datos) });
      onListo();
    } catch (err) {
      setErrorApi(mensajeDeError(err));
    }
  });

  return (
    <Form onSubmit={onSubmit} noValidate>
      {errorApi && <Alert variant="danger">{errorApi}</Alert>}
      <Form.Group className="mb-3" controlId="km-service">
        <Form.Label>Km del auto al hacer el service</Form.Label>
        <Form.Control inputMode="numeric" {...register('km')} isInvalid={!!errors.km} />
        <Form.Control.Feedback type="invalid">{errors.km?.message}</Form.Control.Feedback>
      </Form.Group>
      <BotonGuardar guardando={isSubmitting} texto="Registrar service de hoy" />
    </Form>
  );
}
