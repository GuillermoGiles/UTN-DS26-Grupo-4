import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Button, Container, Card } from 'react-bootstrap';
import { clienteSchema } from '../schemas/clienteSchema';
import type { ClienteValidado, Cliente } from '../schemas/clienteSchema';

interface Props {
  onAgregar: (cliente: Cliente) => void;
}

export function ClienteNuevo({ onAgregar }: Props) {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<ClienteValidado>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: '',
      vehiculo: '',
      patente: '',
      telefono: '',
    }
  });

  const onSubmit = (data: ClienteValidado) => {
    const nuevoCliente: Cliente = {
      ...data,
      id: Date.now(), // ID generado automáticamente
    };
    onAgregar(nuevoCliente);
    navigate('/clientes'); // Redirigir al listado tras un alta exitosa
  };

  return (
    <Container className="mt-4 pt-4 mb-5" style={{ maxWidth: 600 }}>
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <h2 className="mb-4">Nuevo Cliente</h2>
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
              <Button type="submit" variant="primary">
                Guardar Cliente
              </Button>
              <Button variant="secondary" onClick={() => navigate('/clientes')}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
