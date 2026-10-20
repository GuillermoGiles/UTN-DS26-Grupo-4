import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext, type AuthContextType } from '../hooks/useAuth';
import type { Rol, Usuario } from '../types/sesion';

/**
 * Renderiza un componente con un AuthContext falso (mock) y un router en memoria.
 * Sirve para probar la UI según el rol sin levantar el back ni loguearse:
 *   renderConAuth(<Header />, { usuario: null })        → invitado
 *   renderConAuth(<Header />, { usuario: usuarioAdmin }) → ADMIN
 */
export function renderConAuth(
  ui: ReactElement,
  { usuario = null, ruta = '/' }: { usuario?: Usuario | null; ruta?: string } = {},
) {
  const auth: AuthContextType = {
    usuario,
    cargando: false,
    estaAutenticado: usuario !== null,
    tieneRol: (rol: Rol) => usuario?.rol === rol,
    login: vi.fn().mockResolvedValue(usuario),
    logout: vi.fn(),
  };

  return {
    auth,
    ...render(
      <MemoryRouter initialEntries={[ruta]}>
        <AuthContext.Provider value={auth}>{ui}</AuthContext.Provider>
      </MemoryRouter>,
    ),
  };
}
