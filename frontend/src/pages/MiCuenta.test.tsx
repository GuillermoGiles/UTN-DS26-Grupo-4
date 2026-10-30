import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { MiCuenta } from './MiCuenta';
import { renderConAuth } from '../test/renderConAuth';
import { cliente } from '../test/usuarios';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));

const auto = (id: number, patente: string, modelo: string, estado: 'vencido' | 'ok') => ({
  id, patente, marca: 'Ford', modelo, anio: 2020, km: 50000, kmUltimoService: 45000, fechaUltimoService: null,
  createdAt: '2026-01-01', clienteId: 1, service: { estado, proximoKm: estado === 'ok' ? 60000 : 55000, proximaFecha: null },
});
const servicio = { id: 1, nombre: 'Cambio de Aceite', precio: 45000, desc: '', tipo: 'lubricentro' };
const turno = (id: number, vehiculoId: number, fecha: string) => ({
  id, fecha, hora: '10:00', estado: 'COMPLETADO', nota: null, createdAt: fecha, clienteId: 1, vehiculoId,
  servicios: [{ servicioId: 1, servicio }], vehiculo: null,
});
// El Fiesta (id 1) tiene el service vencido → es el que se muestra primero. Tiene 2 servicios; el Ka (id 2), 1.
const ficha = {
  id: 1, nombre: 'Juan Pérez', telefono: '221', dni: null, email: 'juan@mail.test', createdAt: '2026-01-01', usuarioId: 3,
  vehiculos: [auto(1, 'AB123CD', 'Fiesta', 'vencido'), auto(2, 'AC987ZX', 'Ka', 'ok')],
  turnos: [turno(10, 1, '2026-10-01'), turno(11, 1, '2026-09-01'), turno(12, 2, '2026-08-15')],
};

const indicador = (etiqueta: string) => screen.getByText(etiqueta).closest('.card-sgi') as HTMLElement;

describe('Mi cuenta: autos del cliente (Dado / Cuando / Entonces)', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue(ficha as never);
  });

  it('Dado dos autos, Cuando elige otro como auto principal, Entonces las estadísticas pasan a ser de ese auto', async () => {
    renderConAuth(<MiCuenta />, { usuario: cliente });
    const selector = await screen.findByLabelText('AUTO PRINCIPAL');

    // Al entrar: el del service más urgente (Fiesta, 2 servicios)
    expect(selector).toHaveValue('1');
    expect(within(indicador('SERVICIOS REALIZADOS')).getByText('2')).toBeInTheDocument();

    fireEvent.change(selector, { target: { value: '2' } });

    expect(within(indicador('SERVICIOS REALIZADOS')).getByText('1')).toBeInTheDocument();
    expect(within(indicador('PRÓXIMO SERVICE')).getByText(/60\.000/)).toBeInTheDocument();
  });

  it('Dado un auto en Mis autos, Cuando toca eliminar y confirma, Entonces pide DELETE a la API', async () => {
    renderConAuth(<MiCuenta />, { usuario: cliente });

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Ford Ka' }));
    expect(await screen.findByText('¿Eliminar el Ford Ka de tus autos?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await vi.waitFor(() => expect(apiFetch).toHaveBeenCalledWith('/vehiculos/2', { method: 'DELETE' }));
  });

  it('Dado un auto con turnos reservados, Cuando intenta eliminarlo, Entonces muestra el motivo que devuelve la API', async () => {
    renderConAuth(<MiCuenta />, { usuario: cliente });
    await screen.findByRole('button', { name: 'Eliminar Ford Fiesta' });
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('El auto tiene turnos reservados: cancelalos antes de eliminarlo'));

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Ford Fiesta' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('El auto tiene turnos reservados: cancelalos antes de eliminarlo')).toBeInTheDocument();
  });
});
