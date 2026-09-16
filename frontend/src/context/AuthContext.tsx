import { useState, useEffect, type ReactNode } from 'react';
import type { Credenciales, Sesion, Usuario } from '../types/sesion';
import { apiFetch } from '../services/api';
import { obtenerToken, guardarToken, borrarToken } from '../services/sesion';
import { AuthContext } from '../hooks/useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // Si hay token guardado, arrancamos "cargando" hasta que el back confirme quién es.
  // Si no hay token, no hay nada que averiguar: arranca en false.
  const [cargando, setCargando] = useState<boolean>(obtenerToken() !== null);

  // Rehidratación al montar: F5 borra el estado de React pero no el token.
  // Le preguntamos al back (fuente de verdad) en vez de decodificar el token en el front.
  useEffect(() => {
    if (!obtenerToken()) return;
    apiFetch<Usuario>('/auth/yo')
      .then(setUsuario)
      .catch(() => borrarToken())          // vencido o inválido: se limpia
      .finally(() => setCargando(false));
  }, []);

  const login = async (credenciales: Credenciales) => {
    const sesion = await apiFetch<Sesion>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credenciales),
    });
    guardarToken(sesion.token);
    setUsuario(sesion.usuario);
  };

  const logout = () => {
    borrarToken();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        estaAutenticado: usuario !== null,
        tieneRol: (rol) => usuario?.rol === rol,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
