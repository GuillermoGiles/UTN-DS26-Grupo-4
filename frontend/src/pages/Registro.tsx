import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { registroSchema } from '../schemas/registroSchema';
import { apiFetch } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { MarcoFormulario, BotonGuardar } from '../components/Formulario';
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
    defaultValues: { nombre: '', email: '', telefono: '', password: '', confirmar: '' },
  });

  const onSubmit = handleSubmit(async ({ nombre, email, telefono, password }) => {
    setErrorApi(null);
    try {
      await apiFetch('/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nombre, email, telefono, password }),
      });
      await login({ email, password }); // queda logueado sin volver a escribir los datos
      navigate('/mi-cuenta', { replace: true });
    } catch (err) {
      setErrorApi(mensajeDeError(err, 'No se pudo crear la cuenta'));
    }
  });

  return (
    <MarcoFormulario
      titulo="Crear cuenta"
      subtitulo="Con tu cuenta reservás turnos, ves el historial de tus autos y cuándo te toca el próximo service."
      error={errorApi}
      onCerrarError={() => setErrorApi(null)}
      ancho={560}
    >
      <Form onSubmit={onSubmit} noValidate>
        <Form.Group className="mb-3" controlId="nombre">
          <Form.Label>Nombre y apellido</Form.Label>
          <Form.Control {...register('nombre')} isInvalid={!!errors.nombre} autoComplete="name" />
          <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" {...register('email')} isInvalid={!!errors.email} autoComplete="email" />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="telefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control type="tel" {...register('telefono')} isInvalid={!!errors.telefono} placeholder="221-555-1234" />
              <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" {...register('password')} isInvalid={!!errors.password} autoComplete="new-password" />
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-4" controlId="confirmar">
              <Form.Label>Repetí la contraseña</Form.Label>
              <Form.Control type="password" {...register('confirmar')} isInvalid={!!errors.confirmar} autoComplete="new-password" />
              <Form.Control.Feedback type="invalid">{errors.confirmar?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <BotonGuardar guardando={isSubmitting} texto="Crear cuenta" textoGuardando="Creando cuenta..." />
        <p className="text-center text-muted small mt-3 mb-0">
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </p>
      </Form>
    </MarcoFormulario>
  );
}
