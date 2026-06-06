// Molde principal: clava el Header arriba, el Footer abajo, y renderiza la vista activa en el medio ({children}).
import type { ReactNode } from 'react';
import { NavbarSGI } from '../NavbarSGI';
import { Footer } from '../Footer';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <NavbarSGI nombreUsuario="Marcelo Bielsa" />
      <main className="flex-grow-1">
        {children}
      </main>
      <Footer nombreNegocio="Lavadero y Lubricentro San José" anio={2026} />
    </div>
  );
}
