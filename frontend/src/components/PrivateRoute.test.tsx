import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { renderConAuth } from '../test/renderConAuth';
import type { Rol, Usuario } from '../types/sesion';

function RutasDePrueba({ rolRequerido }: { rolRequerido?: Rol | Rol[] }) {
  return (
    <Routes>
      <Route path="/login" element={<div>Pantalla de Login</div>} />
      <Route path="/sin-permiso" element={<div>Pantalla Sin Permiso</div>} />
      <Route element={<PrivateRoute rol={rolRequerido} />}>
        <Route path="/protegida" element={<div>Contenido Protegido</div>} />
      </Route>
    </Routes>
  );
}

describe('PrivateRoute (Dado / Cuando / Entonces)', () => {
  it('Dado un visitante sin sesión, Cuando intenta acceder a una ruta protegida, Entonces lo redirige a /login', () => {
    // Dado / Cuando
    renderConAuth(<RutasDePrueba />, { usuario: null, ruta: '/protegida' });

    // Entonces
    expect(screen.getByText('Pantalla de Login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument();
  });

  it('Dado un usuario CLIENTE, Cuando intenta acceder a una ruta exclusiva de ADMIN, Entonces lo redirige a /sin-permiso', () => {
    // Dado
    const cliente: Usuario = {
      id: 3,
      email: 'cliente@sanjose.test',
      nombre: 'Cliente Frecuente',
      rol: 'CLIENTE',
    };

    // Cuando
    renderConAuth(<RutasDePrueba rolRequerido="ADMIN" />, {
      usuario: cliente,
      ruta: '/protegida',
    });

    // Entonces
    expect(screen.getByText('Pantalla Sin Permiso')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument();
  });

  it('Dado un usuario ADMIN, Cuando accede a una ruta de ADMIN, Entonces renderiza el contenido protegido', () => {
    // Dado
    const admin: Usuario = {
      id: 1,
      email: 'admin@sanjose.test',
      nombre: 'Admin General',
      rol: 'ADMIN',
    };

    // Cuando
    renderConAuth(<RutasDePrueba rolRequerido="ADMIN" />, {
      usuario: admin,
      ruta: '/protegida',
    });

    // Entonces
    expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
  });
});
