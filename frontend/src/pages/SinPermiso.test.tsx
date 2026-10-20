import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { SinPermiso } from './SinPermiso';
import { renderConAuth } from '../test/renderConAuth';

// Test de humo de la infraestructura del front: jsdom + Testing Library + jest-dom
// + el helper renderConAuth. No necesita el back ni la base de datos.
describe('SinPermiso', () => {
  it('muestra "Acceso denegado" a un usuario sin sesión', () => {
    renderConAuth(<SinPermiso />, { usuario: null });
    expect(screen.getByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument();
    expect(screen.getByText('Esta pantalla requiere un rol que tu sesión no tiene.')).toBeInTheDocument();
  });

  it('le dice al usuario logueado con qué rol está', () => {
    renderConAuth(<SinPermiso />, {
      usuario: { id: 3, email: 'cliente@sanjose.test', nombre: 'Cliente Frecuente', rol: 'CLIENTE' },
    });
    expect(screen.getByText('CLIENTE')).toBeInTheDocument();
  });
});
