import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Clientes } from './Clientes';
import { renderConAuth } from '../test/renderConAuth';
import { admin } from '../test/usuarios';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));

const clientes = [
  { id: 7, nombre: 'Prueba Borrar', dni: null, telefono: '221-111-2222', email: null, createdAt: '2026-10-30', usuarioId: null, vehiculos: [], _count: { turnos: 0 } },
];

describe('Clientes: confirmar antes de borrar (Dado / Cuando / Entonces)', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue(clientes as never);
  });

  it('Dado el diálogo de confirmación, Cuando elige "No, volver", Entonces no se borra nada', async () => {
    renderConAuth(<Clientes />, { usuario: admin });
    fireEvent.click(await screen.findByRole('button', { name: 'Borrar' }));

    expect(await screen.findByText('¿Borrar a Prueba Borrar?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'No, volver' }));

    await vi.waitFor(() => expect(screen.queryByText('¿Borrar a Prueba Borrar?')).not.toBeInTheDocument());
    expect(apiFetch).not.toHaveBeenCalledWith('/clientes/7', { method: 'DELETE' });
  });

  it('Dado el diálogo de confirmación, Cuando confirma, Entonces se borra y avisa que salió bien', async () => {
    renderConAuth(<Clientes />, { usuario: admin });
    fireEvent.click(await screen.findByRole('button', { name: 'Borrar' }));

    const dialogo = await screen.findByRole('dialog');
    fireEvent.click(dialogo.querySelector('.btn-sgi') as HTMLElement);

    await vi.waitFor(() => expect(apiFetch).toHaveBeenCalledWith('/clientes/7', { method: 'DELETE' }));
    expect(await screen.findByText('Prueba Borrar fue borrado.')).toBeInTheDocument();
  });
});
