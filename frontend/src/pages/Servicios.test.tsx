import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Servicios } from './Servicios';
import { renderConAuth } from '../test/renderConAuth';
import { admin, cliente } from '../test/usuarios';
import { apiFetch } from '../services/api';

// La API se reemplaza por un mock: el test no necesita el backend levantado
vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));

const catalogo = [
  { id: 1, nombre: 'Cambio de Aceite', precio: 45000, desc: 'Con filtros', tipo: 'lubricentro' },
  { id: 2, nombre: 'Lavado Premium', precio: 12000, desc: 'Interior y exterior', tipo: 'lavadero' },
];

describe('Servicios: botones según el rol (Dado / Cuando / Entonces)', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockResolvedValue(catalogo);
  });

  it('Dado un ADMIN, Cuando carga el catálogo, Entonces ve Nuevo servicio y Editar/Borrar en cada tarjeta', async () => {
    renderConAuth(<Servicios />, { usuario: admin });

    expect(await screen.findByText('Cambio de Aceite')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /nuevo servicio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar Cambio de Aceite' })).toHaveAttribute('href', '/servicios/1/editar');
    expect(screen.getAllByRole('button', { name: /^Borrar/ })).toHaveLength(2);
  });

  it('Dado un CLIENTE, Cuando carga el catálogo, Entonces solo ve Reservar y ningún botón de gestión', async () => {
    renderConAuth(<Servicios />, { usuario: cliente });

    expect(await screen.findByText('Lavado Premium')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /nuevo servicio/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Borrar/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Reservar' })[0]).toHaveAttribute('href', '/turnos/nuevo?servicio=1');
  });

  it('Dado un invitado, Cuando toca Reservar, Entonces lo lleva a iniciar sesión (no a crear cuenta)', async () => {
    renderConAuth(<Servicios />, { usuario: null });

    expect(await screen.findByText('Lavado Premium')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Reservar' })[0]).toHaveAttribute('href', '/login');
  });

  it('Dado que la API falla, Entonces muestra el mensaje de error que devolvió el back', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Error interno del servidor'));
    renderConAuth(<Servicios />, { usuario: null });

    expect(await screen.findByText('Error interno del servidor')).toBeInTheDocument();
  });
});
