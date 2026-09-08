import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container, Form, Alert, Spinner } from 'react-bootstrap';
import { clienteSchema } from '../schemas/clienteSchema';
import type { ClienteValidado } from '../schemas/clienteSchema';
import { apiFetch } from '../services/api';

export function ClienteNuevo() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ClienteValidado>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: '',
      vehiculo: '',
      patente: '',
      telefono: '',
    }
  });

  const onSubmit = async (data: ClienteValidado) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await apiFetch('/api/clientes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      navigate('/clientes'); 
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al guardar el cliente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="mt-4 pt-4 mb-5" style={{ maxWidth: 600 }}>
      <div className="saas-card-dark p-4 text-start">
        <h2 className="mb-4 fw-bold">Nuevo Cliente</h2>
        
        {serverError && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setServerError(null)}>
            <strong>Error:</strong> {serverError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit(onSubmit)}>
          
          <Form.Group className="mb-3">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control 
              {...register('nombre')} 
              isInvalid={!!errors.nombre} 
              placeholder="Ej. Juan Pérez"
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Vehículo</Form.Label>
            <Form.Control 
              {...register('vehiculo')} 
              isInvalid={!!errors.vehiculo} 
              placeholder="Ej. Toyota Corolla"
            />
            <Form.Control.Feedback type="invalid">
              {errors.vehiculo?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Patente</Form.Label>
            <Form.Control 
              {...register('patente')} 
              isInvalid={!!errors.patente} 
              placeholder="Ej. AB 123 CD"
            />
            <Form.Control.Feedback type="invalid">
              {errors.patente?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control 
              {...register('telefono')} 
              isInvalid={!!errors.telefono} 
              placeholder="Ej. 11-1234-5678"
            />
            <Form.Control.Feedback type="invalid">
              {errors.telefono?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="d-flex gap-2">
            <button 
              type="submit" 
              className="btn-primary-custom w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" animation="border" />
                  <span>Guardando...</span>
                </>
              ) : (
                'Guardar Cliente'
              )}
            </button>
            <button type="button" className="btn-outline-custom w-100" onClick={() => navigate('/clientes')} disabled={submitting}>
              Cancelar
            </button>
          </div>
        </Form>
      </div>
    </Container>
  );
}