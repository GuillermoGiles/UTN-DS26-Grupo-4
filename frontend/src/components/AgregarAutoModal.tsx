import { useState } from 'react';
import { Row, Col, Alert, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '../services/api';
import { BotonGuardar } from './Formulario';
import { vehiculoCamposSchema } from '../schemas/clienteSchema';
import { mensajeDeError } from '../utils/formato';
import type { Vehiculo } from '../types/vehiculo';

type Props = { mostrar: boolean; onCerrar: () => void; onGuardado: (vehiculo: Vehiculo) => void };

/**
 * Alta de un auto por el CLIENTE (sin clienteId: la API lo carga a nombre de su ficha).
 * Se usa en Mi cuenta ("Mis autos") y en Reservar turno cuando todavía no tiene ninguno.
 */
export function AgregarAutoModal({ mostrar, onCerrar, onGuardado }: Props) {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(vehiculoCamposSchema),
    defaultValues: { patente: '', marca: '', modelo: '', anio: '', km: '' },
  });

  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    try {
      const vehiculo = await apiFetch<Vehiculo>('/vehiculos', { method: 'POST', body: JSON.stringify(datos) });
      reset();
      onGuardado(vehiculo);
    } catch (err) {
      setErrorApi(mensajeDeError(err));
    }
  });

  return (
    <Modal show={mostrar} onHide={onCerrar} centered>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton><Modal.Title>Agregar un auto</Modal.Title></Modal.Header>
        <Modal.Body>
          {errorApi && <Alert variant="danger">{errorApi}</Alert>}
          <Row className="g-3">
            <Col sm={6}>
              <Form.Group controlId="aa-patente">
                <Form.Label>Patente</Form.Label>
                <Form.Control {...register('patente')} isInvalid={!!errors.patente} placeholder="AB 123 CD" />
                <Form.Control.Feedback type="invalid">{errors.patente?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="aa-km">
                <Form.Label>Km actuales</Form.Label>
                <Form.Control inputMode="numeric" {...register('km')} isInvalid={!!errors.km} />
                <Form.Control.Feedback type="invalid">{errors.km?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="aa-marca">
                <Form.Label>Marca</Form.Label>
                <Form.Control {...register('marca')} isInvalid={!!errors.marca} />
                <Form.Control.Feedback type="invalid">{errors.marca?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="aa-modelo">
                <Form.Label>Modelo</Form.Label>
                <Form.Control {...register('modelo')} isInvalid={!!errors.modelo} />
                <Form.Control.Feedback type="invalid">{errors.modelo?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><BotonGuardar guardando={isSubmitting} texto="Agregar auto" /></Modal.Footer>
      </Form>
    </Modal>
  );
}
