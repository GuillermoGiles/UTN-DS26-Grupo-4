import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Col } from 'react-bootstrap';
import { clienteNuevoSchema } from '../schemas/clienteSchema';
import { apiFetch } from '../services/api';
import { MarcoFormulario, BotonGuardar } from '../components/Formulario';
import { mensajeDeError } from '../utils/formato';
import type { ClienteListado } from '../types/cliente';

/** Alta en el mostrador: el cliente y (opcional) su auto se crean juntos en una sola operación. */
export function ClienteNuevo() {
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(clienteNuevoSchema),
    defaultValues: { nombre: '', telefono: '', email: '', dni: '', conVehiculo: true, patente: '', marca: '', modelo: '', anio: '', km: '' },
  });
  const conVehiculo = useWatch({ control, name: 'conVehiculo' });

  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    try {
      const nuevo = await apiFetch<ClienteListado>('/clientes', { method: 'POST', body: JSON.stringify(datos) });
      navigate(`/clientes/${nuevo.id}`);
    } catch (err) {
      setErrorApi(mensajeDeError(err, 'No se pudo guardar el cliente'));
    }
  });

  return (
    <MarcoFormulario titulo="Nuevo cliente" error={errorApi} onCerrarError={() => setErrorApi(null)} ancho={680}>
      <Form onSubmit={onSubmit} noValidate>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre y apellido</Form.Label>
              <Form.Control {...register('nombre')} isInvalid={!!errors.nombre} placeholder="Ej. Juan Pérez" />
              <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3" controlId="dni">
              <Form.Label>DNI (opcional)</Form.Label>
              <Form.Control inputMode="numeric" {...register('dni')} isInvalid={!!errors.dni} placeholder="28.456.921" />
              <Form.Control.Feedback type="invalid">{errors.dni?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="telefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control {...register('telefono')} isInvalid={!!errors.telefono} placeholder="221-555-1234" />
              <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email (opcional)</Form.Label>
              <Form.Control type="email" {...register('email')} isInvalid={!!errors.email} />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
              <Form.Text className="text-muted">Si después se registra con este email, ve su historial.</Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Form.Check type="switch" id="conVehiculo" label="Cargar su vehículo ahora" className="mb-3" {...register('conVehiculo')} />

        {conVehiculo && (
          <Row className="g-3 mb-2">
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
                <Form.Control {...register('marca')} isInvalid={!!errors.marca} placeholder="Toyota" />
                <Form.Control.Feedback type="invalid">{errors.marca?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="modelo">
                <Form.Label>Modelo</Form.Label>
                <Form.Control {...register('modelo')} isInvalid={!!errors.modelo} placeholder="Corolla" />
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
        )}

        <div className="d-flex gap-2 mt-4">
          <BotonGuardar guardando={isSubmitting} texto="Guardar cliente" />
          <button type="button" className="btn-sgi-outline w-100" onClick={() => navigate('/clientes')}>Cancelar</button>
        </div>
      </Form>
    </MarcoFormulario>
  );
}
