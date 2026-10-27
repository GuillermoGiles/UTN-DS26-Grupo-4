import { useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiAlertCircle } from 'react-icons/fi';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import { useAuth } from '../hooks/useAuth';
import { inicioPorRol } from '../utils/inicioPorRol';
import { CampoPassword } from '../components/CampoPassword';
import { AuthSplit } from '../components/AuthSplit';

export function Login() {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Si PrivateRoute o la expiración de sesión nos mandó acá, leemos el state
  const state = location.state as { desde?: string; sesionExpirada?: boolean } | null;
  const desde = state?.desde;
  const sesionExpirada = Boolean(state?.sesionExpirada);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (datos: LoginFormData) => {
    try {
      setErrorApi(null);
      const usuario = await login(datos); // el token y el usuario quedan en el AuthProvider
      // Vuelve a la pantalla de la que venía; si no venía de ninguna, a la de su rol
      navigate(desde ?? inicioPorRol(usuario.rol), { replace: true });
    } catch (error) {
      setErrorApi(error instanceof Error ? error.message : 'Ocurrió un error inesperado al iniciar sesión');
    }
  };

  return (
    <AuthSplit
      titulo="El cuidado que tu vehículo merece, sin vueltas."
      texto="Reservá tu turno online y llevá el historial de service y lavados de cada auto, siempre a mano."
    >
      <div className="text-center"><span className="chip">TURNOS ONLINE</span></div>
      <h2>Iniciar sesión</h2>
      <p className="text-center text-muted mb-4">Clientes y personal del taller entran por acá.</p>

      {sesionExpirada && !errorApi && (
        <Alert variant="warning" className="d-flex align-items-center gap-2">
          <FiAlertCircle className="flex-shrink-0" />
          <span>Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.</span>
        </Alert>
      )}
      {errorApi && <Alert variant="danger">{errorApi}</Alert>}

      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="juan.perez@gmail.com" autoComplete="email" isInvalid={!!errors.email} {...register('email')} />
          <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-4" controlId="password">
          <Form.Label>Contraseña</Form.Label>
          <CampoPassword autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        </Form.Group>
        <button type="submit" className="btn-sgi" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión...' : 'Ingresar'}
        </button>
      </Form>

      <p className="text-center small mt-4 mb-0">
        ¿No tenés cuenta? <Link to="/registro" className="fw-bold">Registrate para reservar turnos</Link>
      </p>
    </AuthSplit>
  );
}
