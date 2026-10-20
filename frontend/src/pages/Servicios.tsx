import { useState } from 'react';
import { Container, Row, Col, Alert, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { ServicioDestacado } from '../components/ServicioDestacado';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../services/api';
import { mensajeDeError } from '../utils/formato';
import type { Servicio, TipoServicio } from '../types/servicio';

export function Servicios() {
  const { usuario, tieneRol } = useAuth();
  const esAdmin = tieneRol('ADMIN');
  const [tipo, setTipo] = useState<TipoServicio | ''>('');
  const { data: servicios, loading, error, recargar } = useFetch<Servicio[]>(
    tipo ? `/servicios?tipo=${tipo}` : '/servicios',
  );
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);

  const borrar = async (srv: Servicio) => {
    if (!window.confirm(`¿Borrar el servicio "${srv.nombre}"?`)) return;
    setErrorBorrado(null);
    try {
      await apiFetch(`/servicios/${srv.id}`, { method: 'DELETE' });
      recargar();
    } catch (err) {
      setErrorBorrado(mensajeDeError(err)); // ej. 409 si ya tiene turnos o lavados
    }
  };

  // Invitado → registro; cliente y personal → reservar con el servicio preseleccionado
  const destinoReserva = (id: number) => (usuario ? `/turnos/nuevo?servicio=${id}` : '/registro');

  return (
    <Container className="py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <h2 className="mb-1">Servicios</h2>
          <p className="text-muted mb-0">Lavadero y lubricentro. Los precios incluyen mano de obra.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <ButtonGroup aria-label="Filtrar por tipo">
            {(['', 'lavadero', 'lubricentro'] as const).map((t) => (
              <button
                key={t || 'todos'}
                type="button"
                className={tipo === t ? 'btn-primary-custom' : 'btn-outline-custom'}
                onClick={() => setTipo(t)}
              >
                {t === '' ? 'Todos' : t === 'lavadero' ? 'Lavadero' : 'Lubricentro'}
              </button>
            ))}
          </ButtonGroup>
          {esAdmin && (
            <Link to="/servicios/nuevo" className="btn-primary-custom d-flex align-items-center gap-2 text-decoration-none">
              <FiPlus /> Nuevo servicio
            </Link>
          )}
        </div>
      </div>

      {errorBorrado && (
        <Alert variant="danger" dismissible onClose={() => setErrorBorrado(null)}>
          {errorBorrado}
        </Alert>
      )}
      {loading && <Cargando />}
      {error && <ErrorCarga mensaje={error} />}

      {!loading && !error && (
        servicios && servicios.length > 0 ? (
          <Row className="g-4">
            {servicios.map((srv) => (
              <Col key={srv.id} xs={12} sm={6} lg={4} className="d-flex">
                <ServicioDestacado
                  nombre={srv.nombre}
                  precio={srv.precio}
                  descripcion={srv.desc}
                  tipo={srv.tipo}
                  accion={
                    !esAdmin && (
                      <Link to={destinoReserva(srv.id)} className="btn-outline-custom text-decoration-none py-1">
                        Reservar
                      </Link>
                    )
                  }
                  acciones={
                    esAdmin && (
                      <>
                        <Link to={`/servicios/${srv.id}/editar`} className="btn-action-dark" aria-label={`Editar ${srv.nombre}`}>
                          <FiEdit2 /> Editar
                        </Link>
                        <button type="button" className="btn-action-dark" onClick={() => borrar(srv)} aria-label={`Borrar ${srv.nombre}`}>
                          <FiTrash2 /> Borrar
                        </button>
                      </>
                    )
                  }
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Vacio>No hay servicios cargados todavía.</Vacio>
        )
      )}
    </Container>
  );
}
