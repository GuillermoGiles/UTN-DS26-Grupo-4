import { useState } from 'react';
import { Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga } from '../components/Estado';
import { fechaLarga, mensajeDeError } from '../utils/formato';
import { EncabezadoPagina } from '../components/Formulario';
import type { Rol, Usuario } from '../types/sesion';

const COLOR_ROL: Record<Rol, string> = { ADMIN: 'estado-pendiente', EMPLEADO: 'estado-confirmado', CLIENTE: 'estado-sin-datos' };

/** Cuentas del sistema (solo ADMIN). El personal se da de alta acá; los clientes se registran solos. */
export function Usuarios() {
  const { usuario: yo } = useAuth();
  const { data: usuarios, loading, error, recargar } = useFetch<Usuario[]>('/usuarios');
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);

  const borrar = async (u: Usuario) => {
    if (!window.confirm(`¿Borrar la cuenta de ${u.nombre}?`)) return;
    setErrorBorrado(null);
    try {
      await apiFetch(`/usuarios/${u.id}`, { method: 'DELETE' });
      recargar();
    } catch (err) {
      setErrorBorrado(mensajeDeError(err)); // 409 si tiene lavados registrados
    }
  };

  return (
    <div className="page">
      <EncabezadoPagina eyebrow="PERSONAL" titulo="Usuarios" texto="Los clientes crean su cuenta solos; acá se da de alta al personal." />
      {errorBorrado && <Alert variant="danger" dismissible onClose={() => setErrorBorrado(null)}>{errorBorrado}</Alert>}
      <div className="card-sgi p-0">
        <div className="p-4 border-bottom  d-flex justify-content-between align-items-center">
          <p className="text-muted m-0 small">Los clientes crean su cuenta desde “Crear cuenta”. Acá se da de alta al personal.</p>
          <Link to="/usuarios/nuevo" className="btn-sgi text-decoration-none d-flex align-items-center gap-2"><FiPlus /> Nuevo usuario</Link>
        </div>
        {loading && <Cargando />}
        {error && <ErrorCarga mensaje={error} />}
        {usuarios && (
          <Table responsive className="table-sgi mb-0 align-middle">
            <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Alta</th><th></th></tr></thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="fw-bold">{u.nombre}{u.id === yo?.id && <span className="text-muted fw-normal"> (vos)</span>}</td>
                  <td>{u.email}</td>
                  <td><span className={`estado ${COLOR_ROL[u.rol]}`}>{u.rol}</span></td>
                  <td>{u.createdAt ? fechaLarga(u.createdAt) : '—'}</td>
                  <td className="text-end">
                    {u.id !== yo?.id && <button type="button" className="btn-sgi-ghost" onClick={() => borrar(u)}>Borrar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
