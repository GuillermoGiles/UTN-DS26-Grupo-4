import { useState } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { EncabezadoPagina } from '../components/Formulario';
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

  // Cliente y personal → reservar con el servicio preseleccionado.
  // Invitado → iniciar sesión, y al entrar vuelve a esa misma reserva (Login lee state.desde).
  const reserva = (id: number) => `/turnos/nuevo?servicio=${id}`;
  const destinoReserva = (id: number) => (usuario ? reserva(id) : '/login');

  return (
    <div className="page">
      <EncabezadoPagina
        eyebrow="CATÁLOGO"
        titulo="Servicios"
        texto="Lavadero y lubricentro. Los precios incluyen mano de obra."
        acciones={
          <>
            <div className="d-flex gap-1 p-1 rounded-pill" style={{ background: 'var(--surface-2)' }} role="group" aria-label="Filtrar por tipo">
              {(['', 'lavadero', 'lubricentro'] as const).map((t) => (
                <button key={t || 'todos'} type="button" aria-pressed={tipo === t}
                  className={tipo === t ? 'btn-sgi btn-sm-sgi' : 'btn-sgi-ghost'} style={tipo === t ? undefined : { background: 'transparent' }}
                  onClick={() => setTipo(t)}>
                  {t === '' ? 'Todos' : t === 'lavadero' ? 'Lavadero' : 'Lubricentro'}
                </button>
              ))}
            </div>
            {esAdmin && <Link to="/servicios/nuevo" className="btn-sgi"><FiPlus /> Nuevo servicio</Link>}
          </>
        }
      />

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
                      <Link to={destinoReserva(srv.id)} state={usuario ? undefined : { desde: reserva(srv.id) }} className="btn-sgi btn-sm-sgi">
                        Reservar
                      </Link>
                    )
                  }
                  acciones={
                    esAdmin && (
                      <>
                        <Link to={`/servicios/${srv.id}/editar`} className="btn-sgi-ghost" aria-label={`Editar ${srv.nombre}`}>
                          <FiEdit2 /> Editar
                        </Link>
                        <button type="button" className="btn-sgi-ghost" onClick={() => borrar(srv)} aria-label={`Borrar ${srv.nombre}`}>
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
    </div>
  );
}
