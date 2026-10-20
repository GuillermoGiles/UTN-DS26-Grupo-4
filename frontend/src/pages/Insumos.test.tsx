import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Insumos } from './Insumos';
import { renderConAuth } from '../test/renderConAuth';
import { admin, empleado } from '../test/usuarios';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));

const stock = [
  { id: 1, nombre: 'Aceite sintético 5W-30', unidad: 'litros', stock: 40, stockMinimo: 12, bajo: false, createdAt: '', servicios: [] },
  { id: 2, nombre: 'Filtro de aire', unidad: 'unidades', stock: 3, stockMinimo: 4, bajo: true, createdAt: '', servicios: [] },
];

describe('Insumos: alerta de stock y permisos (Dado / Cuando / Entonces)', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockResolvedValue(stock);
  });

  it('Dado un insumo en el mínimo, Cuando se carga la pantalla, Entonces se ve la alerta con su nombre', async () => {
    renderConAuth(<Insumos />, { usuario: empleado });

    expect(await screen.findByText(/llegó al stock mínimo/)).toBeInTheDocument();
    expect(screen.getByText('Stock bajo')).toBeInTheDocument();
    expect(screen.getAllByText('Filtro de aire').length).toBeGreaterThan(0);
  });

  it('Dado un EMPLEADO, Entonces puede ver el stock pero no cargarlo ni crear insumos', async () => {
    renderConAuth(<Insumos />, { usuario: empleado });

    await screen.findByText('Aceite sintético 5W-30');
    expect(screen.queryByRole('button', { name: /cargar \/ ajustar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /nuevo insumo/i })).not.toBeInTheDocument();
  });

  it('Dado un ADMIN, Entonces tiene Cargar / ajustar en cada insumo y Nuevo insumo', async () => {
    renderConAuth(<Insumos />, { usuario: admin });

    await screen.findByText('Aceite sintético 5W-30');
    expect(screen.getAllByRole('button', { name: /cargar \/ ajustar/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /nuevo insumo/i })).toBeInTheDocument();
  });
});
