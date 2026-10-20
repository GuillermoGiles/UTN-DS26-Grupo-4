import type { ReactNode } from 'react';
import { Alert, Spinner } from 'react-bootstrap';

/** Los tres estados de una carga: spinner, error o el contenido. */
export function Cargando({ texto = 'Cargando...' }: { texto?: string }) {
  return (
    <div className="d-flex justify-content-center align-items-center gap-2 py-5 text-muted">
      <Spinner animation="border" size="sm" variant="primary" role="status" />
      <span>{texto}</span>
    </div>
  );
}

export function ErrorCarga({ mensaje }: { mensaje: string }) {
  return (
    <Alert variant="danger" className="my-4 mx-3">
      {mensaje}
    </Alert>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="text-muted text-center py-4 mb-0">{children}</p>;
}
