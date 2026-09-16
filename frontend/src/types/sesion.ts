export type Rol = 'CLIENTE' | 'EMPLEADO' | 'ADMIN';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
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
