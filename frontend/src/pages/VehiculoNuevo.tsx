import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Button, Container, Card } from 'react-bootstrap';
import { z } from 'zod';

// Definimos el esquema de validación con Zod adaptado a la tabla de vehículos
const vehiculoSchema = z.object({
  patente: z.string().trim()
    .min(6, 'La patente debe tener al menos 6 caracteres')
    .max(7, 'La patente no puede superar los 7 caracteres'),
  modelo: z.string().trim().min(2, 'El nombre del modelo es obligatorio'),
  clienteTitular: z.string().trim().min(3, 'El cliente titular es obligatorio'),
});

type VehiculoValidado = z.infer<typeof vehiculoSchema>;

export function VehiculoNuevo() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<VehiculoValidado>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      patente: '',
      modelo: '',
      clienteTitular: ''
    }
  });

  const onSubmit = (data: VehiculoValidado) => {
    console.log("Simulación de alta de vehículo:", data);
    // Redirige de vuelta al listado general tras el envío exitoso
    navigate('/vehiculos');
  };

  return (
    <Container className="mt-4 pt-4 mb-5" style={{ maxWidth: 600 }}>
      <div className="saas-card-dark p-4 text-start">
        <h2 className="mb-4 fw-bold">Nuevo Vehículo</h2>
        <Form onSubmit={handleSubmit(onSubmit)}>
          
          <Form.Group className="mb-3">
            <Form.Label>Patente</Form.Label>
            <Form.Control 
              {...register('patente')} 
              isInvalid={!!errors.patente} 
              placeholder="Ej. AB123CD o XYZ987"
            />
            <Form.Control.Feedback type="invalid">
              {errors.patente?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre / Modelo del Vehículo</Form.Label>
            <Form.Control 
              {...register('modelo')} 
              isInvalid={!!errors.modelo} 
              placeholder="Ej. Toyota Hilux 2.8 TDI"
            />
            <Form.Control.Feedback type="invalid">
              {errors.modelo?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Cliente Titular</Form.Label>
            <Form.Control 
              {...register('clienteTitular')} 
              isInvalid={!!errors.clienteTitular} 
              placeholder="Ej. Juan Pérez"
            />
            <Form.Control.Feedback type="invalid">
              {errors.clienteTitular?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="d-flex gap-2">
            <button type="submit" className="btn-primary-custom w-100 fw-bold">
              Guardar Vehículo
            </button>
            <button type="button" className="btn-outline-custom w-100" onClick={() => navigate('/vehiculos')}>
              Cancelar
            </button>
          </div>
        </Form>
      </div>
    </Container>
  );
}