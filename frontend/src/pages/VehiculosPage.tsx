import { useState } from 'react';
import { Table, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { Patente, ServiceBadge } from '../components/Badges';
import { km, mensajeDeError } from '../utils/formato';
import { EncabezadoPagina } from '../components/Formulario';
import type { EstadoService, VehiculoListado } from '../types/vehiculo';

const ORDEN_SERVICE: Record<EstadoService, number> = { vencido: 0, proximo: 1, 'sin-datos': 2, ok: 3 };

export function VehiculosPage() {
  const { tieneRol } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [soloAtrasados, setSoloAtrasados] = useState(false);
  const q = useDebounce(busqueda.trim(), 300);
  const { data, loading, error, recargar } = useFetch<VehiculoListado[]>(
    q ? `/vehiculos?q=${encodeURIComponent(q)}` : '/vehiculos',
  );
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);

  const vehiculos = (data ?? [])
    .filter((v) => !soloAtrasados || v.service.estado === 'vencido' || v.service.estado === 'proximo')
    .sort((a, b) => ORDEN_SERVICE[a.service.estado] - ORDEN_SERVICE[b.service.estado]);

  const borrar = async (v: VehiculoListado) => {
    if (!window.confirm(`¿Borrar el vehículo ${v.patente}?`)) return;
    setErrorBorrado(null);
    try {
      await apiFetch(`/vehiculos/${v.id}`, { method: 'DELETE' });
      recargar();
    } catch (err) {
      setErrorBorrado(mensajeDeError(err));
    }
  };

  return (
    <div className="page">
      <EncabezadoPagina eyebrow="FLOTA" titulo="Vehículos" texto="Kilometraje de cada auto y cuándo le toca el próximo service." />
      {errorBorrado && <Alert variant="danger" dismissible onClose={() => setErrorBorrado(null)}>{errorBorrado}</Alert>}
      <div className="card-sgi p-0">
        <div className="p-4 border-bottom  d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <Form.Control
              type="search"
              placeholder="Patente, marca, modelo o titular"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ maxWidth: 320 }}
              aria-label="Buscar vehículos"
            />
            <Form.Check type="switch" id="solo-atrasados" label="Solo service vencido o próximo" className="text-reset fw-bold"
              checked={soloAtrasados} onChange={(e) => setSoloAtrasados(e.target.checked)} />
          </div>
          <Link to="/vehiculos/nuevo" className="btn-sgi text-decoration-none d-flex align-items-center gap-2">
            <FiPlus /> Nuevo vehículo
          </Link>
        </div>

        {loading && <Cargando />}
        {error && <ErrorCarga mensaje={error} />}
        {!loading && !error && (vehiculos.length === 0 ? (
          <Vacio>{q || soloAtrasados ? 'Ningún vehículo coincide con el filtro.' : 'Todavía no hay vehículos cargados.'}</Vacio>
        ) : (
          <Table responsive hover className="table-sgi mb-0 align-middle">
            <thead><tr><th>Patente</th><th>Vehículo</th><th>Titular</th><th className="text-end">Km</th><th>Service</th><th></th></tr></thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id}>
                  <td><Patente patente={v.patente} /></td>
                  <td className="fw-bold">{v.marca} {v.modelo}{v.anio ? <span className="text-muted fw-normal"> ({v.anio})</span> : null}</td>
                  <td>
                    <Link to={`/clientes/${v.cliente.id}`} className="text-reset fw-bold">{v.cliente.nombre}</Link>
                    <div className="small text-muted">{v.cliente.telefono}</div>
                  </td>
                  <td className="text-end">{km(v.km)}</td>
                  <td><ServiceBadge service={v.service} /></td>
                  <td className="text-end text-nowrap">
                    <Link to={`/vehiculos/${v.id}`} className="btn-sgi-ghost me-2">Historial</Link>
                    {tieneRol('ADMIN') && <button type="button" className="btn-sgi-ghost" onClick={() => borrar(v)}>Borrar</button>}
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
