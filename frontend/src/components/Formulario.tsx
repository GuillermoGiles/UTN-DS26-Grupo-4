import type { ReactNode } from 'react';
import { Alert, Spinner } from 'react-bootstrap';

/** Marco común de los formularios: tarjeta clara con título y error del servidor. */
export function MarcoFormulario({
  titulo, subtitulo, error, onCerrarError, ancho = 640, children,
}: {
  titulo: string; subtitulo?: string; error?: string | null; onCerrarError?: () => void; ancho?: number; children: ReactNode;
}) {
  return (
    <div className="page" style={{ maxWidth: ancho + 80 }}>
      <div className="card-sgi p-4 p-md-5">
        <h2 className="mb-1" style={{ fontSize: '2rem' }}>{titulo}</h2>
        {subtitulo && <p className="text-muted mb-3">{subtitulo}</p>}
        {error && (
          <Alert variant="danger" dismissible={!!onCerrarError} onClose={onCerrarError} className="mt-3">
            {error}
          </Alert>
        )}
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

export function BotonGuardar({ guardando, texto, textoGuardando = 'Guardando...' }: { guardando: boolean; texto: string; textoGuardando?: string }) {
  return (
    <button type="submit" className="btn-sgi w-100" disabled={guardando}>
      {guardando ? (<><Spinner size="sm" animation="border" /> {textoGuardando}</>) : texto}
    </button>
  );
}

/** Encabezado de página: bajada chica, título grande y acciones a la derecha. */
export function EncabezadoPagina({ eyebrow, titulo, texto, acciones }: { eyebrow?: string; titulo: string; texto?: ReactNode; acciones?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{titulo}</h1>
        {texto && <p>{texto}</p>}
      </div>
      {acciones && <div className="d-flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}
