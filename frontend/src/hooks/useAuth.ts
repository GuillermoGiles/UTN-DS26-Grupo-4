import { createContext, useContext } from 'react';
import type { Credenciales, Rol, Usuario } from '../types/sesion';

export interface AuthContextType {
  usuario: Usuario | null;            // null = nadie logueado
  cargando: boolean;                  // true mientras averiguamos quién sos (/auth/yo)
  estaAutenticado: boolean;           // usuario !== null, para leer más cómodo
  tieneRol: (rol: Rol) => boolean;    // usuario?.rol === rol
  login: (credenciales: Credenciales) => Promise<Usuario>;
  logout: () => void;
}

// El contexto y el hook viven acá (y no en AuthContext.tsx) para que ese archivo
// exporte solo el componente Provider, como pide react-refresh.
export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
