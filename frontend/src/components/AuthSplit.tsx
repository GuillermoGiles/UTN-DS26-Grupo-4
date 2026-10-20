import type { ReactNode } from 'react';
import foto from '../assets/taller.jpg';
import { Marca } from './Layout/Marca';

/** Login y registro: foto del taller a la izquierda, formulario a la derecha. */
export function AuthSplit({ titulo, texto, children }: { titulo: string; texto?: string; children: ReactNode }) {
  return (
    <div className="auth">
      <section className="auth-foto" style={{ backgroundImage: `url(${foto})` }}>
        <Marca />
        <div>
          <h1>{titulo}</h1>
          {texto && <p>{texto}</p>}
        </div>
        <div className="auth-pie">LUNES A SÁBADO · 08:00 A 18:00 HS</div>
      </section>
      <section className="auth-form">
        <div className="auth-card">{children}</div>
      </section>
    </div>
  );
}
