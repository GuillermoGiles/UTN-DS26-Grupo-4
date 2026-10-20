import type { ReactNode } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';

/** Marco común de los formularios de alta: tarjeta oscura, título y error del servidor. */
export function MarcoFormulario({
  titulo,
  subtitulo,
  error,
  onCerrarError,
  ancho = 640,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  error?: string | null;
  onCerrarError?: () => void;
  ancho?: number;
  children: ReactNode;
}) {
  return (
    <Container className="py-5" style={{ maxWidth: ancho }}>
      <div className="saas-card-dark p-4 p-md-5 text-start">
        <h2 className="fw-bold mb-1">{titulo}</h2>
        {subtitulo && <p className="text-muted mb-4">{subtitulo}</p>}
        {error && (
          <Alert variant="danger" dismissible={!!onCerrarError} onClose={onCerrarError} className="mt-3">
            {error}
          </Alert>
        )}
        <div className="mt-3">{children}</div>
      </div>
    </Container>
  );
}

export function BotonGuardar({ guardando, texto, textoGuardando = 'Guardando...' }: { guardando: boolean; texto: string; textoGuardando?: string }) {
  return (
    <button
      type="submit"
      className="btn-primary-custom w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
      disabled={guardando}
    >
      {guardando ? (
        <>
          <Spinner size="sm" animation="border" /> {textoGuardando}
        </>
      ) : (
        texto
      )}
    </button>
  );
}
