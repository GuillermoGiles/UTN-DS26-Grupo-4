import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { lavadoSchema } from '../schemas/lavadoSchema';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../services/api';
import { MarcoFormulario, BotonGuardar } from '../components/Formulario';
import { mensajeDeError, mostrarPatente, pesos } from '../utils/formato';
import type { Servicio } from '../types/servicio';
import { avisarCambioDeStock } from '../utils/stock';
import type { VehiculoListado } from '../types/vehiculo';

/** Auto que llega al lavadero sin turno. El empleado que lo registra es el usuario logueado. */
export function AltaLavado() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const vehiculos = useFetch<VehiculoListado[]>('/vehiculos');
  const servicios = useFetch<Servicio[]>('/servicios?tipo=lavadero');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(lavadoSchema),
    defaultValues: { vehiculoId: '', servicioId: '', observaciones: '' },
  });

  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    try {
      await apiFetch('/lavados', { method: 'POST', body: JSON.stringify(datos) });
      avisarCambioDeStock(); // el lavado descontó insumos
      navigate('/agenda');
    } catch (err) {
      setErrorApi(mensajeDeError(err, 'No se pudo registrar el ingreso'));
    }
  });

  return (
    <MarcoFormulario
      titulo="Ingreso al lavadero"
      subtitulo={`Auto que llega sin turno. Queda registrado a nombre de ${usuario?.nombre ?? 'quien está logueado'}.`}
      error={errorApi}
      onCerrarError={() => setErrorApi(null)}
      ancho={600}
    >
      <Form onSubmit={onSubmit} noValidate>
        <Form.Group className="mb-3" controlId="vehiculoId">
          <Form.Label>Vehículo</Form.Label>
          <Form.Select {...register('vehiculoId')} isInvalid={!!errors.vehiculoId}>
            <option value="">{vehiculos.loading ? 'Cargando vehículos...' : 'Elegí la patente'}</option>
            {(vehiculos.data ?? []).map((v) => (
              <option key={v.id} value={v.id}>{mostrarPatente(v.patente)} — {v.marca} {v.modelo} ({v.cliente.nombre})</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.vehiculoId?.message}</Form.Control.Feedback>
          <Form.Text className="text-muted">¿Es la primera vez que viene? <Link to="/clientes/nuevo">Cargá el cliente y su auto</Link>.</Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="servicioId">
          <Form.Label>Lavado</Form.Label>
          <Form.Select {...register('servicioId')} isInvalid={!!errors.servicioId}>
            <option value="">Elegí el tipo de lavado</option>
            {(servicios.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.nombre} ({pesos(s.precio)})</option>)}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.servicioId?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-4" controlId="observaciones">
          <Form.Label>Observaciones (opcional)</Form.Label>
          <Form.Control as="textarea" rows={2} {...register('observaciones')} isInvalid={!!errors.observaciones} placeholder="Ej: rayón en la puerta trasera" />
          <Form.Control.Feedback type="invalid">{errors.observaciones?.message}</Form.Control.Feedback>
        </Form.Group>
        <BotonGuardar guardando={isSubmitting} texto="Registrar ingreso" />
      </Form>
    </MarcoFormulario>
  );
}
