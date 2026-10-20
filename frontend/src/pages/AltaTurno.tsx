import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { turnoSchema } from '../schemas/turnoSchema';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { apiFetch } from '../services/api';
import { MarcoFormulario, BotonGuardar } from '../components/Formulario';
import { Cargando } from '../components/Estado';
import { horaActualAR, hoyAR, mensajeDeError, mostrarPatente, pesos } from '../utils/formato';
import type { Servicio } from '../types/servicio';
import type { ClienteDetalle, ClienteListado } from '../types/cliente';
import type { Disponibilidad, TurnoConDetalle } from '../types/turno';

/**
 * Reserva de turno. El cliente elige entre sus autos (y la API lo reserva siempre a su nombre);
 * el personal elige primero el cliente y después uno de sus autos.
 * Solo se ofrecen los horarios libres del día elegido (GET /turnos/disponibles).
 */
export function AltaTurno() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { usuario } = useAuth();
  const esCliente = usuario?.rol === 'CLIENTE';
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(turnoSchema),
    defaultValues: {
      fecha: params.get('fecha') ?? hoyAR(),
      hora: '',
      servicioId: params.get('servicio') ?? '',
      vehiculoId: '',
      clienteId: params.get('cliente') ?? '',
      nota: '',
    },
  });

  const [fecha, hora, clienteId] = useWatch({ control, name: ['fecha', 'hora', 'clienteId'] });

  const servicios = useFetch<Servicio[]>('/servicios');
  const disponibilidad = useFetch<Disponibilidad>(fecha ? `/turnos/disponibles?fecha=${fecha}` : null);
  // Cliente: sus autos salen de su ficha. Personal: lista de clientes con sus autos.
  const miFicha = useFetch<ClienteDetalle>(esCliente ? '/clientes/mio' : null);
  const clientes = useFetch<ClienteListado[]>(esCliente ? null : '/clientes');

  // Hoy no se ofrecen los horarios que ya pasaron (la API igual los rechaza con 400)
  const ahora = fecha === hoyAR() ? horaActualAR() : null;
  const pasado = (h: string) => ahora !== null && h <= ahora;
  const libres = (disponibilidad.data?.libres ?? []).filter((h) => !pasado(h));

  const vehiculos = esCliente
    ? miFicha.data?.vehiculos ?? []
    : clientes.data?.find((c) => String(c.id) === clienteId)?.vehiculos ?? [];

  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    try {
      const turno = await apiFetch<TurnoConDetalle>('/turnos', { method: 'POST', body: JSON.stringify(datos) });
      navigate(esCliente ? '/mi-cuenta' : `/agenda?fecha=${turno.fecha}`, { state: { turnoCreado: turno.id } });
    } catch (err) {
      setErrorApi(mensajeDeError(err, 'No se pudo reservar el turno'));
      disponibilidad.recargar(); // si fue un 409, el horario se acaba de ocupar
    }
  });

  return (
    <MarcoFormulario
      titulo="Reservar turno"
      subtitulo="Elegí el día y uno de los horarios libres."
      error={errorApi}
      onCerrarError={() => setErrorApi(null)}
      ancho={720}
    >
      <Form onSubmit={onSubmit} noValidate>
        {!esCliente && (
          <Form.Group className="mb-3" controlId="clienteId">
            <Form.Label>Cliente</Form.Label>
            <Form.Select
              {...register('clienteId', { onChange: () => setValue('vehiculoId', '') })}
              isInvalid={!!errors.clienteId}
            >
              <option value="">{clientes.loading ? 'Cargando clientes...' : 'Elegí el cliente'}</option>
              {(clientes.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.telefono}</option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              ¿No está? <Link to="/clientes/nuevo">Dalo de alta primero</Link>.
            </Form.Text>
          </Form.Group>
        )}

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="servicioId">
              <Form.Label>Servicio</Form.Label>
              <Form.Select {...register('servicioId')} isInvalid={!!errors.servicioId}>
                <option value="">Elegí el servicio</option>
                {(servicios.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre} ({pesos(s.precio)})</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.servicioId?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="vehiculoId">
              <Form.Label>Vehículo</Form.Label>
              <Form.Select {...register('vehiculoId')} disabled={!esCliente && !clienteId}>
                <option value="">{vehiculos.length ? 'Elegí el vehículo' : 'Sin vehículos cargados'}</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>{mostrarPatente(v.patente)} — {v.marca} {v.modelo}</option>
                ))}
              </Form.Select>
              {esCliente && miFicha.data && vehiculos.length === 0 && (
                <Form.Text className="text-muted">
                  Podés <Link to="/mi-cuenta">cargar tu auto en Mi cuenta</Link> o reservar igual.
                </Form.Text>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="fecha" style={{ maxWidth: 260 }}>
          <Form.Label>Día</Form.Label>
          <Form.Control
            type="date"
            min={hoyAR()}
            {...register('fecha', { onChange: () => setValue('hora', '') })}
            isInvalid={!!errors.fecha}
          />
          <Form.Control.Feedback type="invalid">{errors.fecha?.message}</Form.Control.Feedback>
        </Form.Group>

        <fieldset className="mb-3">
          <legend className="form-label fs-6">Horario</legend>
          {disponibilidad.loading && <Cargando texto="Buscando horarios libres..." />}
          {disponibilidad.error && <Alert variant="danger">{disponibilidad.error}</Alert>}
          {disponibilidad.data && (
            libres.length === 0 ? (
              <Alert variant="warning">No quedan horarios libres ese día. Probá con otra fecha.</Alert>
            ) : (
              <div className="d-flex flex-wrap gap-2" role="radiogroup" aria-label="Horarios disponibles">
                {disponibilidad.data.horarios.map((h) => {
                  const ocupado = disponibilidad.data!.ocupados.includes(h) || pasado(h);
                  const elegido = hora === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      role="radio"
                      aria-checked={elegido}
                      disabled={ocupado}
                      onClick={() => setValue('hora', h, { shouldValidate: true })}
                      className={elegido ? 'btn-primary-custom py-1 px-3' : 'btn-action-dark text-dark border-secondary'}
                      style={
                        ocupado
                          ? { textDecoration: 'line-through', opacity: 0.45 }
                          : elegido
                            ? { backgroundColor: 'var(--primary-color)', color: '#fff' }
                            : undefined
                      }
                      title={pasado(h) ? 'Ya pasó' : ocupado ? 'Ocupado' : undefined}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            )
          )}
          {errors.hora && <div className="text-danger small mt-2">{errors.hora.message}</div>}
        </fieldset>

        <Form.Group className="mb-4" controlId="nota">
          <Form.Label>Nota para el taller (opcional)</Form.Label>
          <Form.Control as="textarea" rows={2} {...register('nota')} isInvalid={!!errors.nota} placeholder="Ej: hace un ruido al frenar" />
          <Form.Control.Feedback type="invalid">{errors.nota?.message}</Form.Control.Feedback>
        </Form.Group>

        <BotonGuardar guardando={isSubmitting} texto={hora ? `Confirmar turno a las ${hora}` : 'Confirmar turno'} textoGuardando="Reservando..." />
      </Form>
    </MarcoFormulario>
  );
}
