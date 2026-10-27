import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { turnoSchema } from '../schemas/turnoSchema';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { apiFetch } from '../services/api';
import { Cargando } from '../components/Estado';
import { EncabezadoPagina } from '../components/Formulario';
import { AgregarAutoModal } from '../components/AgregarAutoModal';
import { fechaCorta, horaActualAR, hoyAR, mensajeDeError, mostrarPatente, pesos, sumarDias } from '../utils/formato';

const ULTIMO_HORARIO = '17:30';

/** Primer día con horarios por delante: hoy, o mañana si el taller ya cerró. */
function primerDiaDisponible(): string {
  let dia = horaActualAR() >= ULTIMO_HORARIO ? sumarDias(hoyAR(), 1) : hoyAR();
  if (new Date(`${dia}T12:00:00`).getDay() === 0) dia = sumarDias(dia, 1); // los domingos no se atiende
  return dia;
}
import type { Servicio } from '../types/servicio';
import type { ClienteDetalle, ClienteListado } from '../types/cliente';
import type { Disponibilidad, TurnoConDetalle } from '../types/turno';

/** Próximos 6 días de atención (lunes a sábado) para elegir rápido. */
function proximosDias(desde: string): string[] {
  const dias: string[] = [];
  for (let i = 0; dias.length < 6 && i < 10; i++) {
    const f = sumarDias(desde, i);
    if (new Date(`${f}T12:00:00`).getDay() !== 0) dias.push(f);
  }
  return dias;
}

/**
 * Reserva de turno en tres pasos. El cliente elige entre sus autos (la API lo reserva
 * siempre a su nombre); el personal elige primero el cliente. Solo se ofrecen los
 * horarios libres del día (GET /turnos/disponibles) y nunca los que ya pasaron.
 */
export function AltaTurno() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { usuario } = useAuth();
  const esCliente = usuario?.rol === 'CLIENTE';
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [agregandoAuto, setAgregandoAuto] = useState(false);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(turnoSchema),
    defaultValues: {
      fecha: params.get('fecha') ?? primerDiaDisponible(),
      hora: '',
      servicioIds: params.get('servicio') ? [params.get('servicio') as string] : [],
      vehiculoId: '',
      clienteId: params.get('cliente') ?? '',
      nota: '',
    },
  });
  const [fecha, hora, clienteId, servicioIds, vehiculoId] = useWatch({ control, name: ['fecha', 'hora', 'clienteId', 'servicioIds', 'vehiculoId'] });

  const servicios = useFetch<Servicio[]>('/servicios');
  const disponibilidad = useFetch<Disponibilidad>(fecha ? `/turnos/disponibles?fecha=${fecha}` : null);
  const miFicha = useFetch<ClienteDetalle>(esCliente ? '/clientes/mio' : null);
  const clientes = useFetch<ClienteListado[]>(esCliente ? null : '/clientes');

  const vehiculos = esCliente
    ? miFicha.data?.vehiculos ?? []
    : clientes.data?.find((c) => String(c.id) === clienteId)?.vehiculos ?? [];
  const elegidos = (servicios.data ?? []).filter((s) => servicioIds.includes(String(s.id)));
  const total = elegidos.reduce((suma, s) => suma + s.precio, 0);

  // Se pueden combinar varios servicios, pero un solo lavado: elegir uno de lavadero
  // reemplaza al lavado que estuviera elegido. Los de lubricentro se suman o se quitan.
  const alternarServicio = (s: Servicio) => {
    const id = String(s.id);
    const lista = (servicios.data ?? []);
    const siguiente = servicioIds.includes(id)
      ? servicioIds.filter((x) => x !== id)
      : [...servicioIds.filter((x) => s.tipo !== 'lavadero' || lista.find((o) => String(o.id) === x)?.tipo !== 'lavadero'), id];
    setValue('servicioIds', siguiente, { shouldValidate: true });
  };
  const vehiculo = vehiculos.find((v) => String(v.id) === vehiculoId);

  // Con un solo auto no hace falta elegirlo: queda seleccionado (también el que se acaba de agregar)
  const unicoAuto = vehiculos.length === 1 ? String(vehiculos[0].id) : null;
  useEffect(() => {
    if (unicoAuto && !vehiculoId) setValue('vehiculoId', unicoAuto, { shouldValidate: true });
  }, [unicoAuto, vehiculoId, setValue]);

  // Hoy no se ofrecen los horarios que ya pasaron (la API igual los rechaza con 400)
  const ahora = fecha === hoyAR() ? horaActualAR() : null;
  const pasado = (h: string) => ahora !== null && h <= ahora;
  const libres = (disponibilidad.data?.libres ?? []).filter((h) => !pasado(h));

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
    <div className="page">
      <EncabezadoPagina eyebrow="TURNOS" titulo="Reservar turno" texto="Elegí el vehículo, los servicios y uno de los horarios libres." />
      {errorApi && <Alert variant="danger" dismissible onClose={() => setErrorApi(null)}>{errorApi}</Alert>}

      <Form onSubmit={onSubmit} noValidate>
        <Row className="g-4">
          <Col lg={5} className="d-flex flex-column gap-4">
            <section className="card-sgi card-sgi-body">
              <h5 className="display fs-5 mb-3"><span className="paso">1</span>{esCliente ? 'Tu vehículo' : 'Cliente y vehículo'}</h5>
              {!esCliente && (
                <Form.Group className="mb-3" controlId="clienteId">
                  <Form.Label>Cliente</Form.Label>
                  <Form.Select {...register('clienteId', { onChange: () => setValue('vehiculoId', '') })}>
                    <option value="">{clientes.loading ? 'Cargando clientes...' : 'Elegí el cliente'}</option>
                    {(clientes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}{c.dni ? ` · DNI ${c.dni}` : ''}</option>)}
                  </Form.Select>
                  <Form.Text>¿No está? <Link to="/clientes/nuevo">Dalo de alta primero</Link>.</Form.Text>
                </Form.Group>
              )}
              <Form.Group controlId="vehiculoId">
                <Form.Label>Vehículo</Form.Label>
                <Form.Select {...register('vehiculoId')} disabled={!esCliente && !clienteId} isInvalid={!!errors.vehiculoId}>
                  <option value="">{vehiculos.length ? 'Elegí el vehículo' : 'Sin vehículos cargados'}</option>
                  {vehiculos.map((v) => <option key={v.id} value={v.id}>{mostrarPatente(v.patente)} · {v.marca} {v.modelo}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.vehiculoId?.message}</Form.Control.Feedback>
                {esCliente && miFicha.data && vehiculos.length === 0 && (
                  <Alert variant="warning" className="mt-2 mb-0 small d-flex flex-wrap align-items-center justify-content-between gap-2">
                    Para reservar necesitás cargar tu auto.
                    <button type="button" className="btn-sgi btn-sm-sgi" onClick={() => setAgregandoAuto(true)}>Agregar auto</button>
                  </Alert>
                )}
                {!esCliente && clienteId && vehiculos.length === 0 && (
                  <Form.Text>Este cliente no tiene autos: <Link to="/vehiculos/nuevo">cargale uno</Link> antes de reservar.</Form.Text>
                )}
              </Form.Group>
            </section>

            <section className="card-sgi card-sgi-body">
              <h5 className="display fs-5 mb-3"><span className="paso">3</span>Día y horario</h5>
              <Form.Label as="div">Día</Form.Label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {proximosDias(primerDiaDisponible()).map((d) => (
                  <button key={d} type="button" className={`opcion text-center py-2 px-3${fecha === d ? ' elegida' : ''}`} style={{ width: 'auto' }}
                    onClick={() => { setValue('fecha', d, { shouldValidate: true }); setValue('hora', ''); }} aria-pressed={fecha === d}>
                    <div className="fw-bold small">{fechaCorta(d).toUpperCase()}</div>
                  </button>
                ))}
              </div>
              <Form.Control type="date" min={hoyAR()} aria-label="Otra fecha" className="mb-3" style={{ maxWidth: 220 }}
                {...register('fecha', { onChange: () => setValue('hora', '') })} isInvalid={!!errors.fecha} />

              <Form.Label as="div">Horarios libres</Form.Label>
              {disponibilidad.loading && <Cargando texto="Buscando horarios libres..." />}
              {disponibilidad.data && (libres.length === 0
                ? <Alert variant="warning" className="mb-0">{disponibilidad.data.cerrado ? 'Los domingos el taller está cerrado. Elegí otro día.' : 'No quedan horarios libres ese día. Probá con otro.'}</Alert>
                : (
                  <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))' }} role="radiogroup" aria-label="Horarios disponibles">
                    {libres.map((h) => (
                      <button key={h} type="button" role="radio" aria-checked={hora === h} className={`opcion text-center py-2${hora === h ? ' elegida' : ''}`}
                        onClick={() => setValue('hora', h, { shouldValidate: true })}>{h}</button>
                    ))}
                  </div>
                ))}
              {errors.hora && <div className="text-danger small mt-2">{errors.hora.message}</div>}
            </section>
          </Col>

          <Col lg={7} className="d-flex flex-column gap-4">
            <section className="card-sgi card-sgi-body">
              <h5 className="display fs-5 mb-1"><span className="paso">2</span>Servicios</h5>
              <p className="small text-muted mb-3">Podés combinar varios. De lavadero, uno solo por turno.</p>
              {servicios.loading && <Cargando />}
              <Row className="g-3">
                {(servicios.data ?? []).map((s) => (
                  <Col key={s.id} sm={6}>
                    <button type="button" className={`opcion h-100${servicioIds.includes(String(s.id)) ? ' elegida' : ''}`} aria-pressed={servicioIds.includes(String(s.id))}
                      onClick={() => alternarServicio(s)}>
                      <span className={`estado ${s.tipo === 'lubricentro' ? 'estado-pendiente' : 'estado-confirmado'} mb-2`}>{s.tipo === 'lubricentro' ? 'Lubricentro' : 'Lavadero'}</span>
                      <div className="fw-bold display fs-5">{s.nombre}</div>
                      <div className="small text-muted mb-2">{s.desc}</div>
                      <div className="opcion-precio">{pesos(s.precio)}</div>
                    </button>
                  </Col>
                ))}
              </Row>
              {errors.servicioIds && <div className="text-danger small mt-2">{errors.servicioIds.message}</div>}
              <Form.Group className="mt-3" controlId="nota">
                <Form.Label>Nota para el taller (opcional)</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('nota')} isInvalid={!!errors.nota} placeholder="Ej: hace un ruido al frenar en frío" />
                <Form.Control.Feedback type="invalid">{errors.nota?.message}</Form.Control.Feedback>
              </Form.Group>
            </section>

            <section className="resumen-turno">
              <div>
                <small className="fw-bold">RESUMEN DEL TURNO</small>
                <h4 className="mt-1">{elegidos.length ? elegidos.map((s) => s.nombre).join(' + ') : 'Elegí uno o más servicios'}</h4>
                <small>{fechaCorta(fecha)}{hora ? ` · ${hora} hs` : ' · elegí un horario'}{vehiculo ? ` · ${mostrarPatente(vehiculo.patente)}` : ''}</small>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="text-end"><small className="d-block">Total estimado</small><span className="resumen-total">{pesos(total)}</span></div>
                <button type="submit" className="btn-sgi" disabled={isSubmitting}>
                  {isSubmitting ? <><Spinner size="sm" animation="border" /> Reservando...</> : hora ? `Confirmar turno a las ${hora}` : 'Confirmar turno'}
                </button>
              </div>
            </section>
          </Col>
        </Row>
      </Form>

      {/* El cliente sin autos lo carga acá mismo y queda elegido para el turno */}
      <AgregarAutoModal mostrar={agregandoAuto} onCerrar={() => setAgregandoAuto(false)}
        onGuardado={() => { setAgregandoAuto(false); miFicha.recargar(); }} />
    </div>
  );
}
