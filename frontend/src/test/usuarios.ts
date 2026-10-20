import type { Usuario } from '../types/sesion';

export const admin: Usuario = { id: 1, email: 'admin@sanjose.test', nombre: 'Admin General', rol: 'ADMIN' };
export const empleado: Usuario = { id: 2, email: 'empleado@sanjose.test', nombre: 'Operario Taller', rol: 'EMPLEADO' };
export const cliente: Usuario = { id: 3, email: 'cliente@sanjose.test', nombre: 'Cliente Frecuente', rol: 'CLIENTE' };
