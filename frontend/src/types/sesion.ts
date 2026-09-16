export type Rol = 'CLIENTE' | 'EMPLEADO' | 'ADMIN';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}
