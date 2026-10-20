import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Form, Alert, Row, Col } from 'react-bootstrap';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { servicioSchema, type ServicioValidado } from '../schemas/servicioSchema';
import { apiFetch } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { MarcoFormulario, BotonGuardar } from '../components/Formulario';
import { Cargando } from '../components/Estado';
import { mensajeDeError } from '../utils/formato';
import type { Servicio } from '../types/servicio';
import type { Insumo } from '../types/insumo';

type ServicioConReceta = Servicio & { insumos: { cantidad: number; insumo: { id: number; nombre: string; unidad: string } }[] };

/** Alta (/servicios/nuevo) y edición (/servicios/:id/editar) con el mismo formulario. Solo ADMIN. */
export function ServicioForm() {
  const { id } = useParams();
  const esEdicion = id !== undefined;
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { data: actual, loading, error } = useFetch<ServicioConReceta>(esEdicion ? `/servicios/${id}` : null);
  const recienCreado = Boolean((useLocation().state as { creado?: boolean } | null)?.creado);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ServicioValidado>({
    resolver: zodResolver(servicioSchema),
    defaultValues: { nombre: '', precio: undefined, desc: '', tipo: 'lavadero' },
  });

  // Precarga los valores actuales cuando llegan de la API
  useEffect(() => {
    if (actual) reset({ nombre: actual.nombre, precio: actual.precio, desc: actual.desc, tipo: actual.tipo });
  }, [actual, reset]);

  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    try {
      const guardado = await apiFetch<Servicio>(esEdicion ? `/servicios/${id}` : '/servicios', {
        method: esEdicion ? 'PUT' : 'POST',
        body: JSON.stringify(datos),
      });
      // Recién creado: se queda en la edición para cargar los insumos que consume
      if (esEdicion) navigate('/servicios');
      else navigate(`/servicios/${guardado.id}/editar`, { replace: true, state: { creado: true } });
    } catch (err) {
      setErrorApi(mensajeDeError(err, 'No se pudo guardar el servicio'));
    }
  });

  if (esEdicion && loading) return <Cargando />;

  return (
    <MarcoFormulario
      titulo={esEdicion ? 'Editar servicio' : 'Nuevo servicio'}
      error={errorApi ?? error}
      onCerrarError={() => setErrorApi(null)}
      ancho={600}
    >
      <Form onSubmit={onSubmit} noValidate>
        <Form.Group className="mb-3" controlId="nombre">
          <Form.Label>Nombre</Form.Label>
          <Form.Control {...register('nombre')} isInvalid={!!errors.nombre} placeholder="Ej: Lavado Premium" />
          <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="precio">
          <Form.Label>Precio ($)</Form.Label>
          <Form.Control type="number" min={1} {...register('precio', { valueAsNumber: true })} isInvalid={!!errors.precio} placeholder="Ej: 15000" />
          <Form.Control.Feedback type="invalid">{errors.precio?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="desc">
          <Form.Label>Descripción</Form.Label>
          <Form.Control as="textarea" rows={3} {...register('desc')} isInvalid={!!errors.desc} placeholder="Qué incluye el servicio" />
          <Form.Control.Feedback type="invalid">{errors.desc?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-4" controlId="tipo">
          <Form.Label>Tipo</Form.Label>
          <Form.Select {...register('tipo')} isInvalid={!!errors.tipo}>
            <option value="lavadero">Lavadero</option>
            <option value="lubricentro">Lubricentro</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.tipo?.message}</Form.Control.Feedback>
        </Form.Group>
        <div className="d-flex gap-2">
          <BotonGuardar guardando={isSubmitting} texto={esEdicion ? 'Guardar cambios' : 'Crear servicio'} />
          <button type="button" className="btn-sgi-outline w-100" onClick={() => navigate('/servicios')}>
            Cancelar
          </button>
        </div>
      </Form>

      {esEdicion && actual && (
        <>
          {recienCreado && <Alert variant="success" className="mt-4">Servicio creado. Ahora podés indicar qué insumos consume.</Alert>}
          <RecetaServicio servicioId={actual.id} inicial={actual.insumos} />
        </>
      )}
    </MarcoFormulario>
  );
}

type Item = { insumoId: string; cantidad: string };

/** Receta: qué insumos consume el servicio cada vez que se hace (se descuentan solos). */
function RecetaServicio({ servicioId, inicial }: { servicioId: number; inicial: ServicioConReceta['insumos'] }) {
  const { data: insumos } = useFetch<Insumo[]>('/insumos');
  const [items, setItems] = useState<Item[]>(inicial.map((r) => ({ insumoId: String(r.insumo.id), cantidad: String(r.cantidad) })));
  const [estado, setEstado] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cambiar = (i: number, campo: keyof Item, valor: string) =>
    setItems((prev) => prev.map((it, j) => (j === i ? { ...it, [campo]: valor } : it)));

  const guardar = async () => {
    const completos = items.filter((it) => it.insumoId && Number(it.cantidad.replace(',', '.')) > 0);
    if (completos.length !== items.length) {
      setEstado({ tipo: 'danger', texto: 'Cada fila necesita un insumo y una cantidad mayor a 0.' });
      return;
    }
    setGuardando(true);
    setEstado(null);
    try {
      await apiFetch(`/servicios/${servicioId}/insumos`, {
        method: 'PUT',
        body: JSON.stringify({ insumos: completos.map((it) => ({ insumoId: Number(it.insumoId), cantidad: Number(it.cantidad.replace(',', '.')) })) }),
      });
      setEstado({ tipo: 'success', texto: 'Insumos guardados. Se van a descontar solos cada vez que se complete este servicio.' });
    } catch (err) {
      setEstado({ tipo: 'danger', texto: mensajeDeError(err) });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="mt-4 pt-4 border-top">
      <h3 className="fs-4 mb-1">Insumos que consume</h3>
      <p className="text-muted small">Al completar un turno o registrar un lavado de este servicio, se descuentan del stock.</p>
      {estado && <Alert variant={estado.tipo} dismissible onClose={() => setEstado(null)}>{estado.texto}</Alert>}
      {items.length === 0 && <p className="text-muted small">No consume insumos.</p>}
      {items.map((it, i) => {
        const unidad = insumos?.find((x) => String(x.id) === it.insumoId)?.unidad ?? '';
        return (
          <Row key={i} className="g-2 mb-2 align-items-center">
            <Col xs={7}>
              <Form.Select aria-label={`Insumo ${i + 1}`} value={it.insumoId} onChange={(e) => cambiar(i, 'insumoId', e.target.value)}>
                <option value="">Elegí un insumo</option>
                {(insumos ?? []).map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
              </Form.Select>
            </Col>
            <Col xs={3}>
              <Form.Control aria-label={`Cantidad ${i + 1}`} inputMode="decimal" placeholder={unidad || 'cant.'} value={it.cantidad} onChange={(e) => cambiar(i, 'cantidad', e.target.value)} />
            </Col>
            <Col xs={2}>
              <button type="button" className="btn-sgi-ghost w-100" aria-label={`Quitar insumo ${i + 1}`} onClick={() => setItems((p) => p.filter((_, j) => j !== i))}><FiTrash2 /></button>
            </Col>
          </Row>
        );
      })}
      <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn-sgi-outline btn-sm-sgi" onClick={() => setItems((p) => [...p, { insumoId: '', cantidad: '' }])}><FiPlus /> Agregar insumo</button>
        <button type="button" className="btn-sgi-teal btn-sm-sgi ms-auto" onClick={guardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar insumos'}</button>
      </div>
    </section>
  );
}
