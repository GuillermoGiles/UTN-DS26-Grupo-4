import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Container, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { servicioSchema } from '../schemas/servicioSchema';
import type { ServicioValidado } from '../schemas/servicioSchema';
import { apiFetch } from '../services/api';
import type { Servicio } from '../types/servicio';

export function ServicioNuevo() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ServicioValidado>({
    resolver: zodResolver(servicioSchema),
    defaultValues: {
      nombre: '',
      precio: '' as unknown as number,
      desc: '',
      tipo: 'lavadero'
    }
  });

  const onSubmit = async (data: ServicioValidado) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await apiFetch<Servicio>('/servicios', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      navigate('/servicios');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al guardar el servicio');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 600 }}>
      <div className="saas-card-dark p-4">
        <h2 className="text-center mb-4 fw-bold">Agregar Nuevo Servicio</h2>
        
        {serverError && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setServerError(null)}>
            <strong>Error:</strong> {serverError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit(onSubmit)}>
          
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Servicio</Form.Label>
            <Form.Control
              {...register('nombre')}
              isInvalid={!!errors.nombre}
              placeholder="Ej: Lavado Premium"
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio ($)</Form.Label>
            <Form.Control
              type="number"
              {...register('precio', { valueAsNumber: true })}
              isInvalid={!!errors.precio}
              placeholder="Ej: 15000"
            />
            <Form.Control.Feedback type="invalid">
              {errors.precio?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...register('desc')}
              isInvalid={!!errors.desc}
              placeholder="Detalle de lo que incluye el servicio..."
            />
            <Form.Control.Feedback type="invalid">
              {errors.desc?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Tipo de Servicio</Form.Label>
            <Form.Select {...register('tipo')} isInvalid={!!errors.tipo}>
              <option value="lavadero">Lavadero</option>
              <option value="lubricentro">Lubricentro</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.tipo?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <button 
            type="submit" 
            className="btn-primary-custom w-100 fw-bold mt-2 d-flex align-items-center justify-content-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner size="sm" animation="border" />
                <span>Guardando...</span>
              </>
            ) : (
              'Guardar Servicio'
            )}
          </button>
        </Form>
      </div>
    </Container>
  );
}