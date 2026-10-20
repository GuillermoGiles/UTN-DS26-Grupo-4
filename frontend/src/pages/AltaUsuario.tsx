import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usuarioSchema } from '../schemas/usuarioSchema';
import { apiFetch } from '../services/api';
import { MarcoFormulario, BotonGuardar } from '../components/Formulario';
import { mensajeDeError } from '../utils/formato';

/** Alta de personal (solo ADMIN): rol EMPLEADO o ADMIN. */
export function AltaUsuario() {
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { nombre: '', email: '', password: '', confirmar: '', rol: 'EMPLEADO' as const },
  });

  const onSubmit = handleSubmit(async ({ nombre, email, password, rol }) => {
    setErrorApi(null);
    try {
      await apiFetch('/usuarios', { method: 'POST', body: JSON.stringify({ nombre, email, password, rol }) });
      navigate('/usuarios');
    } catch (err) {
      setErrorApi(mensajeDeError(err, 'No se pudo crear el usuario'));
    }
  });

  return (
    <MarcoFormulario titulo="Nuevo usuario del personal" error={errorApi} onCerrarError={() => setErrorApi(null)} ancho={600}>
      <Form onSubmit={onSubmit} noValidate>
        <Form.Group className="mb-3" controlId="nombre">
          <Form.Label>Nombre y apellido</Form.Label>
          <Form.Control {...register('nombre')} isInvalid={!!errors.nombre} />
          <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" {...register('email')} isInvalid={!!errors.email} />
          <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña inicial</Form.Label>
              <Form.Control type="password" {...register('password')} isInvalid={!!errors.password} autoComplete="new-password" />
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="confirmar">
              <Form.Label>Repetir contraseña</Form.Label>
              <Form.Control type="password" {...register('confirmar')} isInvalid={!!errors.confirmar} autoComplete="new-password" />
              <Form.Control.Feedback type="invalid">{errors.confirmar?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-4" controlId="rol">
          <Form.Label>Rol</Form.Label>
          <Form.Select {...register('rol')} isInvalid={!!errors.rol}>
            <option value="EMPLEADO">Empleado: agenda, clientes, vehículos y lavados</option>
            <option value="ADMIN">Administrador: además servicios, usuarios y panel</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.rol?.message}</Form.Control.Feedback>
        </Form.Group>
        <div className="d-flex gap-2">
          <BotonGuardar guardando={isSubmitting} texto="Crear usuario" />
          <button type="button" className="btn-sgi-outline w-100" onClick={() => navigate('/usuarios')}>Cancelar</button>
        </div>
      </Form>
    </MarcoFormulario>
  );
}
