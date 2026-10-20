import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Col } from 'react-bootstrap';
import { vehiculoSchema } from '../schemas/vehiculoSchema';
import { apiFetch } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { MarcoFormulario, BotonGuardar } from '../components/Formulario';
import { mensajeDeError } from '../utils/formato';
import type { ClienteListado } from '../types/cliente';
import type { VehiculoListado } from '../types/vehiculo';

/** Alta de vehículo por el personal: hay que elegir el titular (desde la ficha viene preseleccionado). */
export function VehiculoNuevo() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const clientes = useFetch<ClienteListado[]>('/clientes');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: { clienteId: params.get('cliente') ?? '', patente: '', marca: '', modelo: '', anio: '', km: '' },
  });

  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    if (!datos.clienteId) {
      setErrorApi('Elegí el titular del vehículo');
      return;
    }
    try {
      const nuevo = await apiFetch<VehiculoListado>('/vehiculos', { method: 'POST', body: JSON.stringify(datos) });
      navigate(`/vehiculos/${nuevo.id}`);
    } catch (err) {
      setErrorApi(mensajeDeError(err, 'No se pudo guardar el vehículo'));
    }
  });

  return (
    <MarcoFormulario titulo="Nuevo vehículo" error={errorApi} onCerrarError={() => setErrorApi(null)} ancho={640}>
      <Form onSubmit={onSubmit} noValidate>
        <Form.Group className="mb-3" controlId="clienteId">
          <Form.Label>Titular</Form.Label>
          <Form.Select {...register('clienteId')}>
            <option value="">{clientes.loading ? 'Cargando clientes...' : 'Elegí el cliente'}</option>
            {(clientes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre} — {c.telefono}</option>)}
          </Form.Select>
        </Form.Group>
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="patente">
              <Form.Label>Patente</Form.Label>
              <Form.Control {...register('patente')} isInvalid={!!errors.patente} placeholder="AB 123 CD" />
              <Form.Control.Feedback type="invalid">{errors.patente?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="marca">
              <Form.Label>Marca</Form.Label>
              <Form.Control {...register('marca')} isInvalid={!!errors.marca} />
              <Form.Control.Feedback type="invalid">{errors.marca?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="modelo">
              <Form.Label>Modelo</Form.Label>
              <Form.Control {...register('modelo')} isInvalid={!!errors.modelo} />
              <Form.Control.Feedback type="invalid">{errors.modelo?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="anio">
              <Form.Label>Año (opcional)</Form.Label>
              <Form.Control inputMode="numeric" {...register('anio')} isInvalid={!!errors.anio} />
              <Form.Control.Feedback type="invalid">{errors.anio?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="km">
              <Form.Label>Km actuales (opcional)</Form.Label>
              <Form.Control inputMode="numeric" {...register('km')} isInvalid={!!errors.km} />
              <Form.Control.Feedback type="invalid">{errors.km?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex gap-2 mt-4">
          <BotonGuardar guardando={isSubmitting} texto="Guardar vehículo" />
          <button type="button" className="btn-outline-custom w-100" onClick={() => navigate(-1)}>Cancelar</button>
        </div>
      </Form>
    </MarcoFormulario>
  );
}
