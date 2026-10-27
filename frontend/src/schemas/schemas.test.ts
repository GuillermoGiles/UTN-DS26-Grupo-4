import { describe, it, expect } from 'vitest';
import { registroSchema } from './registroSchema';
import { clienteNuevoSchema } from './clienteSchema';
import { turnoSchema } from './turnoSchema';

describe('Validaciones de los formularios (Zod)', () => {
  it('registro: rechaza contraseñas que no coinciden, marcando el campo confirmar', () => {
    const r = registroSchema.safeParse({
      nombre: 'Ana Ruiz', email: 'ana@mail.test', telefono: '221-555-1234', dni: '', password: 'secreta1', confirmar: 'otra',
    });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(['confirmar']);
  });

  it('alta de cliente: si se marca "con vehículo", la patente pasa a ser obligatoria', () => {
    const base = { nombre: 'Marta', telefono: '221-333-2222', email: '', dni: '', patente: '', marca: '', modelo: '', anio: '', km: '' };
    expect(clienteNuevoSchema.safeParse({ ...base, conVehiculo: false }).success).toBe(true);

    const conAuto = clienteNuevoSchema.safeParse({ ...base, conVehiculo: true });
    expect(conAuto.success).toBe(false);
    if (!conAuto.success) expect(conAuto.error.issues.map((i) => i.path[0])).toContain('patente');
  });

  it('alta de cliente: arma el body que espera la API, con patente y DNI normalizados y los km como número', () => {
    const r = clienteNuevoSchema.safeParse({
      nombre: 'Marta', telefono: '221-333-2222', email: '', dni: '28.456.921', conVehiculo: true,
      patente: 'ab 456-cd', marca: 'Peugeot', modelo: '208', anio: '', km: '15000',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({
        nombre: 'Marta', telefono: '221-333-2222', email: undefined, dni: '28456921',
        vehiculo: { patente: 'AB456CD', marca: 'Peugeot', modelo: '208', anio: undefined, km: 15000 },
      });
    }
  });

  it('turno: los <select> llegan como texto y salen como ids numéricos (vacío → undefined)', () => {
    const r = turnoSchema.safeParse({ fecha: '2026-10-25', hora: '10:30', servicioIds: ['2', '5'], vehiculoId: '4', clienteId: '', nota: '' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ servicioIds: [2, 5], vehiculoId: 4, clienteId: undefined, nota: undefined });
  });

  it('turno: sin vehículo elegido no se puede reservar', () => {
    const r = turnoSchema.safeParse({ fecha: '2026-10-25', hora: '10:30', servicioIds: ['2'], vehiculoId: '', clienteId: '', nota: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('Elegí el vehículo');
  });

  it('turno: sin ningún servicio elegido muestra el error', () => {
    const r = turnoSchema.safeParse({ fecha: '2026-10-25', hora: '10:30', servicioIds: [], vehiculoId: '4', clienteId: '', nota: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('Elegí al menos un servicio');
  });
});
