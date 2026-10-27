import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { AltaTurno } from './AltaTurno';
import { renderConAuth } from '../test/renderConAuth';
import { cliente } from '../test/usuarios';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));

const catalogo = [
  { id: 1, nombre: 'Cambio de Aceite', precio: 45000, desc: '', tipo: 'lubricentro' },
  { id: 3, nombre: 'Alineación y Balanceo', precio: 25000, desc: '', tipo: 'lubricentro' },
  { id: 2, nombre: 'Lavado Premium', precio: 12000, desc: '', tipo: 'lavadero' },
  { id: 5, nombre: 'Lavado Básico', precio: 7000, desc: '', tipo: 'lavadero' },
];

// Cada endpoint que pide la pantalla devuelve su dato de prueba
let vehiculosDelCliente: object[] = [];
function mockApi(url: string) {
  if (url === '/servicios') return Promise.resolve(catalogo);
  if (url.startsWith('/turnos/disponibles')) return Promise.resolve({ fecha: '2030-01-15', horarios: ['10:00'], ocupados: [], libres: ['10:00'] });
  if (url === '/clientes/mio') return Promise.resolve({ id: 1, vehiculos: vehiculosDelCliente, turnos: [] });
  return Promise.resolve(null);
}

const boton = (nombre: string) => screen.getByRole('button', { name: new RegExp(nombre) });

describe('AltaTurno: elegir varios servicios (Dado / Cuando / Entonces)', () => {
  beforeEach(() => {
    vehiculosDelCliente = [];
    vi.mocked(apiFetch).mockImplementation(mockApi as never);
  });

  it('Dado un cliente sin autos, Cuando entra a reservar, Entonces le pide cargar uno y no reserva sin vehículo', async () => {
    renderConAuth(<AltaTurno />, { usuario: cliente });

    expect(await screen.findByText('Para reservar necesitás cargar tu auto.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Confirmar turno/ }));
    expect(await screen.findByText('Elegí el vehículo')).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalledWith('/turnos', expect.anything());
  });

  it('Dado un cliente con un solo auto, Cuando entra a reservar, Entonces ese auto queda elegido', async () => {
    vehiculosDelCliente = [{ id: 4, patente: 'AB123CD', marca: 'Toyota', modelo: 'Hilux' }];
    renderConAuth(<AltaTurno />, { usuario: cliente });

    const select = await screen.findByLabelText('Vehículo');
    await screen.findByRole('option', { name: /AB 123 CD|AB123CD/ });
    await vi.waitFor(() => expect(select).toHaveValue('4'));
  });

  it('Dado un cliente, Cuando elige dos de lubricentro y un lavado, Entonces quedan los tres y el total los suma', async () => {
    renderConAuth(<AltaTurno />, { usuario: cliente });
    await screen.findByText('Cambio de Aceite');

    fireEvent.click(boton('Cambio de Aceite'));
    fireEvent.click(boton('Alineación y Balanceo'));
    fireEvent.click(boton('Lavado Básico'));

    expect(boton('Cambio de Aceite')).toHaveAttribute('aria-pressed', 'true');
    expect(boton('Alineación y Balanceo')).toHaveAttribute('aria-pressed', 'true');
    expect(boton('Lavado Básico')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Cambio de Aceite + Alineación y Balanceo + Lavado Básico')).toBeInTheDocument();
  });

  it('Dado un Lavado Básico elegido, Cuando elige el Premium, Entonces el Básico se desmarca (un solo lavado por turno)', async () => {
    renderConAuth(<AltaTurno />, { usuario: cliente });
    await screen.findByText('Lavado Básico');

    fireEvent.click(boton('Cambio de Aceite'));
    fireEvent.click(boton('Lavado Básico'));
    fireEvent.click(boton('Lavado Premium'));

    expect(boton('Lavado Premium')).toHaveAttribute('aria-pressed', 'true');
    expect(boton('Lavado Básico')).toHaveAttribute('aria-pressed', 'false');
    expect(boton('Cambio de Aceite')).toHaveAttribute('aria-pressed', 'true');
  });

  it('Dado un servicio elegido, Cuando lo toca de nuevo, Entonces se quita', async () => {
    renderConAuth(<AltaTurno />, { usuario: cliente });
    await screen.findByText('Cambio de Aceite');

    fireEvent.click(boton('Cambio de Aceite'));
    fireEvent.click(boton('Cambio de Aceite'));

    expect(boton('Cambio de Aceite')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Elegí uno o más servicios')).toBeInTheDocument();
  });
});
