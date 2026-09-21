import { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiAlertCircle } from 'react-icons/fi';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Si PrivateRoute o la expiración de sesión nos mandó acá, leemos el state
  const state = location.state as { desde?: string; sesionExpirada?: boolean } | null;
  const desde = state?.desde ?? '/';
  const sesionExpirada = Boolean(state?.sesionExpirada);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (datos: LoginFormData) => {
    try {
      setErrorApi(null);
      await login(datos);              // el token y el usuario quedan en el AuthProvider
      navigate(desde, { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setErrorApi(error.message);
      } else {
        setErrorApi('Ocurrió un error inesperado al iniciar sesión');
      }
    }
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4 fw-bold">Iniciar Sesión</h2>
          
          {sesionExpirada && !errorApi && (
            <Alert variant="warning" className="d-flex align-items-center gap-2">
              <FiAlertCircle className="flex-shrink-0" />
              <span>Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.</span>
            </Alert>
          )}

          {errorApi && <Alert variant="danger">{errorApi}</Alert>}
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresá tu email"
                isInvalid={!!errors.email}
                {...register('email')}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresá tu contraseña"
                isInvalid={!!errors.password}
                {...register('password')}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Ingresar'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
