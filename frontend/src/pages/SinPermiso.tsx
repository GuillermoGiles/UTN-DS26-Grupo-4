import { Container, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiArrowLeft, FiHome } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

/**
 * La cara del 403: el usuario está logueado pero su rol no alcanza.
 * No cierra la sesión (eso es cosa del 401).
 */
export function SinPermiso() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  return (
    <Container className="py-5 d-flex justify-content-center">
      <div className="card-sgi p-5 text-center" style={{ width: '100%', maxWidth: '560px' }}>
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
          style={{ width: 72, height: 72, backgroundColor: 'rgba(255, 193, 7, 0.15)' }}
        >
          <FiLock size={34} className="text-warning" />
        </div>

        <h2 className="fw-bold mb-2">Acceso denegado</h2>
        <p className="text-muted mb-4">
          No tenés permiso para ver esta sección.
        </p>

        <Alert variant="warning" className="text-start">
          {usuario ? (
            <>
              Estás logueado como <strong>{usuario.nombre}</strong> con rol{' '}
              <strong>{usuario.rol}</strong>, pero esta pantalla requiere un rol distinto.
              Si creés que es un error, contactá al administrador.
            </>
          ) : (
            <>Esta pantalla requiere un rol que tu sesión no tiene.</>
          )}
        </Alert>

        <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-4">
          <button
            type="button"
            className="btn-sgi-outline d-inline-flex align-items-center justify-content-center gap-2"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft /> Volver
          </button>
          <Link
            to="/"
            className="btn-sgi d-inline-flex align-items-center justify-content-center gap-2 text-decoration-none"
          >
            <FiHome /> Ir al inicio
          </Link>
        </div>
      </div>
    </Container>
  );
}
