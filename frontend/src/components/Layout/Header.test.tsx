import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Header } from './Header';
import { renderConAuth } from '../../test/renderConAuth';
import { admin, cliente, empleado } from '../../test/usuarios';

const link = (nombre: string) => screen.queryByRole('link', { name: nombre });

describe('Header: la NavBar según la sesión (Dado / Cuando / Entonces)', () => {
  it('Dado un visitante sin sesión, Entonces ve Ingresar y Crear cuenta, y ningún link interno', () => {
    renderConAuth(<Header />, { usuario: null });

    expect(link('Ingresar')).toBeInTheDocument();
    expect(link('Crear cuenta')).toBeInTheDocument();
    expect(link('Agenda')).not.toBeInTheDocument();
    expect(link('Panel')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /salir/i })).not.toBeInTheDocument();
  });

  it('Dado un CLIENTE, Entonces ve Mi cuenta y Reservar turno, pero no la gestión del taller', () => {
    renderConAuth(<Header />, { usuario: cliente });

    expect(link('Mi cuenta')).toBeInTheDocument();
    expect(link('Reservar turno')).toBeInTheDocument();
    expect(link('Clientes')).not.toBeInTheDocument();
    expect(link('Panel')).not.toBeInTheDocument();
    expect(screen.getByText('Cliente Frecuente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salir/i })).toBeInTheDocument();
  });

  it('Dado un EMPLEADO, Entonces ve la operación diaria pero no Panel ni Usuarios', () => {
    renderConAuth(<Header />, { usuario: empleado });

    expect(link('Agenda')).toBeInTheDocument();
    expect(link('Clientes')).toBeInTheDocument();
    expect(link('Vehículos')).toBeInTheDocument();
    expect(link('Panel')).not.toBeInTheDocument();
    expect(link('Usuarios')).not.toBeInTheDocument();
  });

  it('Dado un ADMIN, Entonces además ve Panel y Usuarios', () => {
    renderConAuth(<Header />, { usuario: admin });

    expect(link('Panel')).toBeInTheDocument();
    expect(link('Usuarios')).toBeInTheDocument();
    expect(link('Mi cuenta')).not.toBeInTheDocument();
  });
});
