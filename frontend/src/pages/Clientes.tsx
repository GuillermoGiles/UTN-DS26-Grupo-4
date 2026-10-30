import { useState } from 'react';
import { Table, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { Patente } from '../components/Badges';
import { mensajeDeError } from '../utils/formato';
import { EncabezadoPagina } from '../components/Formulario';
import { useConfirmar } from '../hooks/useConfirmar';
import type { ClienteListado } from '../types/cliente';

export function Clientes() {
  const { tieneRol } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const q = useDebounce(busqueda.trim(), 300); // no pedir a la API en cada tecla
  const { data: clientes, loading, error, recargar } = useFetch<ClienteListado[]>(
    q ? `/clientes?q=${encodeURIComponent(q)}` : '/clientes',
  );
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const { confirmar, modalConfirmar } = useConfirmar();

  const borrar = async (c: ClienteListado) => {
    if (!(await confirmar({ titulo: `¿Borrar a ${c.nombre}?`, texto: 'También se borran sus vehículos. Esta acción no se puede deshacer.' }))) return;
    setErrorBorrado(null);
    setOk(null);
    try {
      await apiFetch(`/clientes/${c.id}`, { method: 'DELETE' });
      setOk(`${c.nombre} fue borrado.`);
      recargar();
    } catch (err) {
      setErrorBorrado(mensajeDeError(err)); // 409 si tiene turnos
    }
  };

  return (
    <div className="page">
      <EncabezadoPagina eyebrow="DIRECTORIO" titulo="Clientes" texto="Buscá por nombre, DNI, teléfono o patente." />
      {ok && <Alert variant="success" dismissible onClose={() => setOk(null)}>{ok}</Alert>}
      {errorBorrado && <Alert variant="danger" dismissible onClose={() => setErrorBorrado(null)}>{errorBorrado}</Alert>}
      {modalConfirmar}
      <div className="card-sgi p-0">
        <div className="p-4 border-bottom  d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <Form.Control
            type="search"
            placeholder="Buscar por nombre, DNI, teléfono o patente"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ maxWidth: 360 }}
            aria-label="Buscar clientes"
          />
          <Link to="/clientes/nuevo" className="btn-sgi text-decoration-none d-flex align-items-center gap-2">
            <FiPlus /> Nuevo cliente
          </Link>
        </div>

        {loading && <Cargando />}
        {error && <ErrorCarga mensaje={error} />}
        {!loading && !error && clientes && (clientes.length === 0 ? (
          <Vacio>{q ? `Ningún cliente coincide con “${q}”.` : 'Todavía no hay clientes cargados.'}</Vacio>
        ) : (
          <Table responsive hover className="table-sgi align-middle mb-0">
            <thead>
              <tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Vehículos</th><th className="text-center">Turnos</th><th>Cuenta web</th><th></th></tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td className="fw-bold"><Link to={`/clientes/${c.id}`} className="text-reset fw-bold">{c.nombre}</Link></td>
                  <td>{c.dni ?? <span className="text-muted">—</span>}</td>
                  <td>{c.telefono}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {c.vehiculos.length ? c.vehiculos.map((v) => <Patente key={v.id} patente={v.patente} />) : <span className="text-muted">—</span>}
                    </div>
                  </td>
                  <td className="text-center">{c._count.turnos}</td>
                  <td>{c.usuarioId ? 'Sí' : <span className="text-muted">No</span>}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/clientes/${c.id}`} className="btn-sgi-ghost me-2">Ver ficha</Link>
                    {tieneRol('ADMIN') && (
                      <button type="button" className="btn-sgi-ghost" onClick={() => borrar(c)}>Borrar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ))}
      </div>
    </div>
  );
}
