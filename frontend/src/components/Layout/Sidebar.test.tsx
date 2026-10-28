import { describe, it, expect, vi } from 'vitest';
import { screen, act } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { renderConAuth } from '../../test/renderConAuth';
import { admin } from '../../test/usuarios';
import { apiFetch } from '../../services/api';
import { avisarCambioDeStock } from '../../utils/stock';

vi.mock('../../services/api', () => ({ apiFetch: vi.fn() }));

const filtroDeAire = (stock: number) => [{ id: 4, nombre: 'Filtro de aire', unidad: 'unidades', stock, minimo: 4, bajo: stock <= 4 }];

describe('Sidebar: contador de insumos bajos (Dado / Cuando / Entonces)', () => {
  it('Dado un insumo en el mínimo, Cuando se carga stock y supera el mínimo, Entonces el contador desaparece solo', async () => {
    // Dado: 3 filtros de aire, mínimo 4 → contador en 1
    vi.mocked(apiFetch).mockResolvedValueOnce(filtroDeAire(3) as never);
    renderConAuth(<Sidebar abierta onNavegar={() => {}} />, { usuario: admin });
    const enlace = await screen.findByRole('link', { name: /Insumos/ });
    await vi.waitFor(() => expect(enlace).toHaveTextContent('1'));

    // Cuando: otra pantalla carga 10 filtros y avisa que cambió el stock
    vi.mocked(apiFetch).mockResolvedValueOnce(filtroDeAire(13) as never);
    act(() => avisarCambioDeStock());

    // Entonces: el menú vuelve a pedir /insumos y el 1 ya no está
    await vi.waitFor(() => expect(enlace).not.toHaveTextContent('1'));
    expect(apiFetch).toHaveBeenCalledTimes(2);
  });
});
