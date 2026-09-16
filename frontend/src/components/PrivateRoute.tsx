import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../types/sesion';

type PrivateRouteProps = {
  /** Rol (o lista de roles) habilitados. Si se omite, alcanza con estar logueado. */
  rol?: Rol | Rol[];
};

/**
 * Layout route (sin path) que protege a todas sus rutas hijas.
 * Resuelve tres preguntas, en este orden:
 *   1. ¿Ya sé quién sos?   -> cargando: Spinner, no decido nada todavía
 *   2. ¿Sos alguien?       -> sin usuario: /login  (equivale al 401 del back)
 *   3. ¿Podés?             -> sin el rol: /sin-permiso (equivale al 403 del back)
 * Si pasa las tres, renderiza la hija en el <Outlet />.
 */
export function PrivateRoute({ rol }: PrivateRouteProps) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  // 1. Todavía no llegó la respuesta de /auth/yo: esperar, no redirigir con datos viejos
  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Verificando sesión...</span>
        </Spinner>
      </div>
    );
  }

  // 2. Nadie logueado: a login. `replace` para que "atrás" no vuelva a la ruta protegida.
  //    Guardamos de dónde venía para que el login pueda devolverlo ahí.
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  // 3. Logueado pero sin el rol necesario: a la pantalla de acceso denegado
  if (rol) {
    const rolesPermitidos = Array.isArray(rol) ? rol : [rol];
    if (!rolesPermitidos.includes(usuario.rol)) {
      return <Navigate to="/sin-permiso" replace />;
    }
  }

  // Pasó las tres: la ruta hija se renderiza acá
  return <Outlet />;
}
