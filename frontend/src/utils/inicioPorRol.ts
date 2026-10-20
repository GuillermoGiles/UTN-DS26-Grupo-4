import type { Rol } from '../types/sesion';

/** A dónde va cada rol después de entrar, si no venía de otra pantalla. */
export function inicioPorRol(rol: Rol): string {
  if (rol === 'ADMIN') return '/panel';
  if (rol === 'EMPLEADO') return '/agenda';
  return '/mi-cuenta';
}
