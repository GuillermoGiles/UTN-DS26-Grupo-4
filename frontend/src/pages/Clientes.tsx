import { useState } from 'react';
import { Container, Table, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { Patente } from '../components/Badges';
import { mensajeDeError } from '../utils/formato';
import type { ClienteListado } from '../types/cliente';

export function Clientes() {
  const { tieneRol } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const q = useDebounce(busqueda.trim(), 300); // no pedir a la API en cada tecla
  const { data: clientes, loading, error, recargar } = useFetch<ClienteListado[]>(
    q ? `/clientes?q=${encodeURIComponent(q)}` : '/clientes',
  );
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);

  const borrar = async (c: ClienteListado) => {
    if (!window.confirm(`¿Borrar a ${c.nombre}? También se borran sus vehículos.`)) return;
    setErrorBorrado(null);
    try {
      await apiFetch(`/clientes/${c.id}`, { method: 'DELETE' });
      recargar();
    } catch (err) {
      setErrorBorrado(mensajeDeError(err)); // 409 si tiene turnos
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold">Clientes</h2>
      {errorBorrado && <Alert variant="danger" dismissible onClose={() => setErrorBorrado(null)}>{errorBorrado}</Alert>}
      <div className="saas-card-dark p-0">
        <div className="p-4 border-bottom border-secondary d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <Form.Control
            type="search"
            placeholder="Buscar por nombre, teléfono o patente"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ maxWidth: 360 }}
            aria-label="Buscar clientes"
          />
          <Link to="/clientes/nuevo" className="btn-primary-custom text-decoration-none d-flex align-items-center gap-2">
            <FiPlus /> Nuevo cliente
          </Link>
        </div>

        {loading && <Cargando />}
        {error && <ErrorCarga mensaje={error} />}
        {!loading && !error && clientes && (clientes.length === 0 ? (
          <Vacio>{q ? `Ningún cliente coincide con “${q}”.` : 'Todavía no hay clientes cargados.'}</Vacio>
        ) : (
          <Table responsive hover variant="dark" className="align-middle mb-0">
            <thead>
              <tr><th>Nombre</th><th>Teléfono</th><th>Vehículos</th><th className="text-center">Turnos</th><th>Cuenta web</th><th></th></tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td className="fw-bold"><Link to={`/clientes/${c.id}`} className="text-white">{c.nombre}</Link></td>
                  <td>{c.telefono}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {c.vehiculos.length ? c.vehiculos.map((v) => <Patente key={v.id} patente={v.patente} />) : <span className="text-muted">—</span>}
                    </div>
                  </td>
                  <td className="text-center">{c._count.turnos}</td>
                  <td>{c.usuarioId ? 'Sí' : <span className="text-muted">No</span>}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/clientes/${c.id}`} className="btn-action-dark me-2">Ver ficha</Link>
                    {tieneRol('ADMIN') && (
                      <button type="button" className="btn-action-dark" onClick={() => borrar(c)}>Borrar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ))}
      </div>
    </Container>
  );
}
