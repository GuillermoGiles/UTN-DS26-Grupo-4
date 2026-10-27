import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { registroSchema } from '../schemas/registroSchema';
import { apiFetch } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { BotonGuardar } from '../components/Formulario';
import { AuthSplit } from '../components/AuthSplit';
import { CampoPassword } from '../components/CampoPassword';
import { mensajeDeError } from '../utils/formato';

/**
 * Registro público: siempre crea una cuenta CLIENTE (el back ignora cualquier "rol").
 * Si el lubricentro ya te tenía cargado con ese email, la cuenta queda vinculada a tu historial.
 */
export function Registro() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registroSchema),
    defaultValues: { nombre: '', email: '', telefono: '', dni: '', password: '', confirmar: '' },
  });

  const onSubmit = handleSubmit(async ({ confirmar: _c, ...datos }) => {
    void _c;
    setErrorApi(null);
    try {
      await apiFetch('/auth/registro', { method: 'POST', body: JSON.stringify(datos) });
      await login({ email: datos.email, password: datos.password }); // queda logueado sin volver a escribir
      navigate('/mi-cuenta', { replace: true });
    } catch (err) {
      setErrorApi(mensajeDeError(err, 'No se pudo crear la cuenta'));
    }
  });

  return (
    <AuthSplit
      titulo="Creá tu cuenta y reservá en minutos."
      texto="Si ya viniste al taller, usá el mismo email: vas a ver el historial de tus autos desde el primer día."
    >
      <h2 className="mt-0">Crear cuenta</h2>
      <p className="text-center text-muted mb-4">Para reservar turnos y ver cuándo te toca el service.</p>
      {errorApi && <Alert variant="danger" dismissible onClose={() => setErrorApi(null)}>{errorApi}</Alert>}

      <Form onSubmit={onSubmit} noValidate>
        <Form.Group className="mb-3" controlId="nombre">
          <Form.Label>Nombre y apellido</Form.Label>
          <Form.Control {...register('nombre')} isInvalid={!!errors.nombre} autoComplete="name" placeholder="Juan Pérez" />
          <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" {...register('email')} isInvalid={!!errors.email} autoComplete="email" placeholder="juan@email.com" />
          <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
        </Form.Group>
        <Row>
          <Col sm={6}>
            <Form.Group className="mb-3" controlId="telefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control type="tel" {...register('telefono')} isInvalid={!!errors.telefono} placeholder="221-555-1234" />
              <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group className="mb-3" controlId="dni">
              <Form.Label>DNI (opcional)</Form.Label>
              <Form.Control inputMode="numeric" {...register('dni')} isInvalid={!!errors.dni} placeholder="28.456.921" />
              <Form.Control.Feedback type="invalid">{errors.dni?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <CampoPassword {...register('password')} error={errors.password?.message} autoComplete="new-password" placeholder="Mínimo 6 caracteres" />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group className="mb-4" controlId="confirmar">
              <Form.Label>Repetí la contraseña</Form.Label>
              <CampoPassword {...register('confirmar')} error={errors.confirmar?.message} autoComplete="new-password" />
            </Form.Group>
          </Col>
        </Row>
        <BotonGuardar guardando={isSubmitting} texto="Crear cuenta" textoGuardando="Creando cuenta..." />
        <p className="text-center small mt-3 mb-0">¿Ya tenés cuenta? <Link to="/login" className="fw-bold">Ingresá</Link></p>
      </Form>
    </AuthSplit>
  );
}
