export type Rol = 'CLIENTE' | 'EMPLEADO' | 'ADMIN';

/** Lo que devuelven GET /auth/yo y POST /auth/login (nunca incluye passwordHash). */
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
  createdAt?: string;
}

/** Lo que el usuario escribe en el formulario de login. */
export interface Credenciales {
  email: string;
  password: string;
}

/** Lo que devuelve POST /auth/login. */
export interface Sesion {
  token: string;
  usuario: Usuario;
}
