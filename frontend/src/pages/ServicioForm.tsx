import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { servicioSchema, type ServicioValidado } from '../schemas/servicioSchema';
import { apiFetch } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { MarcoFormulario, BotonGuardar } from '../components/Formulario';
import { Cargando } from '../components/Estado';
import { mensajeDeError } from '../utils/formato';
import type { Servicio } from '../types/servicio';

/** Alta (/servicios/nuevo) y edición (/servicios/:id/editar) con el mismo formulario. Solo ADMIN. */
export function ServicioForm() {
  const { id } = useParams();
  const esEdicion = id !== undefined;
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { data: actual, loading, error } = useFetch<Servicio>(esEdicion ? `/servicios/${id}` : null);

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
      await apiFetch<Servicio>(esEdicion ? `/servicios/${id}` : '/servicios', {
        method: esEdicion ? 'PUT' : 'POST',
        body: JSON.stringify(datos),
      });
      navigate('/servicios');
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
          <button type="button" className="btn-outline-custom w-100" onClick={() => navigate('/servicios')}>
            Cancelar
          </button>
        </div>
      </Form>
    </MarcoFormulario>
  );
}
