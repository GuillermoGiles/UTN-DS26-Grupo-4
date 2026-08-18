import type { Cliente } from "../types/cliente.types";

// Datos hardcodeados — misma forma que frontend/public/clientes.json
const clientes: Cliente[] = [
  { id: 1, nombre: "Blasko Telechea", vehiculo: "Fiat Duna", patente: "FGH 452", telefono: "11-1234-5678" },
  { id: 2, nombre: "Lautaro Diguilmi", vehiculo: "Toyota Corolla", patente: "XTZ 987", telefono: "11-9876-5432" },
  { id: 3, nombre: "Federico Corbalan", vehiculo: "VW Gol", patente: "EF 456 GH", telefono: "11-4567-8901" },
];

let proximoId = 4;

export function findAll(): Cliente[] {
  return clientes;
}

export function findById(id: number): Cliente | undefined {
  return clientes.find((c) => c.id === id);
}

export function create(datos: Omit<Cliente, "id">): Cliente {
  const nuevo: Cliente = { id: proximoId++, ...datos };
  clientes.push(nuevo);
  return nuevo;
}

export function update(id: number, datos: Omit<Cliente, "id">): Cliente | undefined {
  const index = clientes.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  clientes[index] = { id, ...datos };
  return clientes[index];
}

export function remove(id: number): boolean {
  const index = clientes.findIndex((c) => c.id === id);
  if (index === -1) return false;
  clientes.splice(index, 1);
  return true;
}
