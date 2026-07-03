import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lavadoSchema } from '../validations/lavadoSchema';
import type { LavadoValidado } from '../validations/lavadoSchema';

export function AltaLavado() {
  const navigate = useNavigate();
  
  // Conectamos React Hook Form con nuestro esquema de Zod
  const { register, handleSubmit, formState: { errors } } = useForm<LavadoValidado>({
    resolver: zodResolver(lavadoSchema)
  });

  const onSubmit = (data: LavadoValidado) => {
    console.log('Nuevo lavado registrado:', data);
    // Acá iría el POST al backend. Por ahora, redirigimos al éxito.
    navigate('/panel'); 
  };

  return (
    <Container className="py-5" style={{ maxWidth: '600px' }}>
      <div className="saas-card-dark p-4">
        <h3 className="fw-bold mb-4">Ingreso de Vehículo</h3>
        <Form onSubmit={handleSubmit(onSubmit)}>
          
          <Form.Group className="mb-3">
            <Form.Label>Patente</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Ej: AB 123 CD"
              {...register('patente')} 
              isInvalid={!!errors.patente} 
            />
            <Form.Control.Feedback type="invalid">
              {errors.patente?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Modelo</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Ej: Ford Ka o Chevrolet Sonic"
              {...register('modelo')} 
              isInvalid={!!errors.modelo} 
            />
            <Form.Control.Feedback type="invalid">
              {errors.modelo?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de Servicio</Form.Label>
            <Form.Select {...register('tipoLavado')} isInvalid={!!errors.tipoLavado}>
              <option value="">Seleccione un servicio...</option>
              <option value="basico">Lavado Básico</option>
              <option value="premium">Lavado Premium</option>
              <option value="tapizado">Limpieza de Tapizados</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.tipoLavado?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Empleado Asignado</Form.Label>
            <Form.Select {...register('empleado')} isInvalid={!!errors.empleado}>
              <option value="">Asignar a...</option>
              <option value="marcos">Marcos Díaz</option>
              <option value="juan">Juan Pérez</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.empleado?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <button type="submit" className="btn-primary-custom w-100 mt-2">
            Registrar Ingreso
          </button>
        </Form>
      </div>
    </Container>
  );
}