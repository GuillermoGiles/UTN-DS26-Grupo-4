import type { Servicio } from "../types/servicio.types";

// Datos hardcodeados — misma forma que frontend/public/servicios.json
const servicios: Servicio[] = [
  { id: 1, nombre: "Cambio de Aceite", precio: 45000, desc: "Servicio técnico completo con reemplazo de filtros esenciales.", tipo: "lubricentro" },
  { id: 2, nombre: "Lavado Premium", precio: 12000, desc: "Limpieza artesanal profunda exterior e interior.", tipo: "lavadero" },
  { id: 3, nombre: "Alineación y Balanceo", precio: 25000, desc: "Ajuste de tren delantero y balanceo computarizado.", tipo: "lubricentro" },
  { id: 4, nombre: "Limpieza Tapizados", precio: 35000, desc: "Lavado en seco de butacas y alfombras con máquinas de inyección.", tipo: "lavadero" },
];

let proximoId = 5;

export function findAll(tipo?: string): Servicio[] {
  if (tipo === undefined) return servicios;
  return servicios.filter((s) => s.tipo === tipo);
}

export function findById(id: number): Servicio | undefined {
  return servicios.find((s) => s.id === id);
}

export function create(datos: Omit<Servicio, "id">): Servicio {
  const nuevo: Servicio = { id: proximoId++, ...datos };
  servicios.push(nuevo);
  return nuevo;
}

export function update(id: number, datos: Omit<Servicio, "id">): Servicio | undefined {
  const index = servicios.findIndex((s) => s.id === id);
  if (index === -1) return undefined;
  servicios[index] = { id, ...datos };
  return servicios[index];
}

export function remove(id: number): boolean {
  const index = servicios.findIndex((s) => s.id === id);
  if (index === -1) return false;
  servicios.splice(index, 1);
  return true;
}
