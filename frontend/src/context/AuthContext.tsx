import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Rol } from '../types/sesion';
import { apiFetch } from '../services/api';
import { obtenerToken, guardarToken, borrarToken } from '../services/sesion';

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  estaAutenticado: boolean;
  tieneRol: (rol: Rol) => boolean;
  login: (datos: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(obtenerToken() !== null);

  useEffect(() => {
    if (!obtenerToken()) {
        setCargando(false);
        return;
    }
    apiFetch<Usuario>('/auth/yo')
      .then(setUsuario)
      .catch(() => borrarToken())
      .finally(() => setCargando(false));
  }, []);

  const login = async (datos: any) => {
    const res = await apiFetch<{token: string, usuario: Usuario}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(datos)
    });
    guardarToken(res.token);
    setUsuario(res.usuario);
  };

  const logout = () => {
    borrarToken();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      estaAutenticado: usuario !== null,
      tieneRol: (r) => usuario?.rol === r,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
