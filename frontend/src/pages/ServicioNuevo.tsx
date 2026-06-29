import { useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { servicioSchema } from '../schemas/servicioSchema';
import type { ServicioValidado } from '../schemas/servicioSchema';

export function ServicioNuevo() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<ServicioValidado>({
    resolver: zodResolver(servicioSchema),
    defaultValues: {
      nombre: '',
      precio: 0,
      desc: '',
      tipo: 'lavadero'
    }
  });

  const onSubmit = (data: ServicioValidado) => {
    console.log("Simulación de alta de servicio:", data);
    // En el futuro acá irá el fetch con POST. Por ahora redirige.
    navigate('/servicios');
  };

  return (
    <Container className="py-5" style={{ maxWidth: 600 }}>
      <h2 className="text-center mb-4 fw-bold text-secondary">Agregar Nuevo Servicio</h2>
      <Form onSubmit={handleSubmit(onSubmit)} className="border p-4 rounded shadow-sm bg-white">
        
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

        <Button variant="primary" type="submit" className="w-100 fw-bold">
          Guardar Servicio
        </Button>
      </Form>
    </Container>
  );
}