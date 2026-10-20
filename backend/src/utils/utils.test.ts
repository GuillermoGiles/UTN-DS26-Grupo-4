import { describe, it, expect } from "vitest";
import { calcularProximoService } from "./service";
import { hoyAR, sumarDias, rangoDelDia, yaPaso } from "./fechas";
import { normalizarPatente, PATENTE_REGEX } from "./patente";
import { HORARIOS } from "../config/negocio";

const HOY = new Date("2026-10-20T12:00:00Z");
const haceMeses = (m: number) => {
  const d = new Date(HOY);
  d.setMonth(d.getMonth() - m);
  return d;
};

describe("calcularProximoService (10.000 km o 6 meses, lo que pase primero)", () => {
  it("Dado un auto sin ningún service registrado, Entonces el estado es sin-datos", () => {
    const r = calcularProximoService({ km: 50_000, kmUltimoService: null, fechaUltimoService: null }, HOY);
    expect(r).toEqual({ estado: "sin-datos", proximoKm: null, proximaFecha: null });
  });

  it("Dado un service reciente y pocos km, Entonces está ok y el próximo es a +10.000 km", () => {
    const r = calcularProximoService({ km: 52_000, kmUltimoService: 50_000, fechaUltimoService: haceMeses(1) }, HOY);
    expect(r.estado).toBe("ok");
    expect(r.proximoKm).toBe(60_000);
  });

  it("Dado que faltan menos de 1.000 km, Entonces avisa proximo", () => {
    const r = calcularProximoService({ km: 59_500, kmUltimoService: 50_000, fechaUltimoService: haceMeses(1) }, HOY);
    expect(r.estado).toBe("proximo");
  });

  it("Dado que pasaron más de 6 meses aunque tenga pocos km, Entonces está vencido", () => {
    const r = calcularProximoService({ km: 51_000, kmUltimoService: 50_000, fechaUltimoService: haceMeses(7) }, HOY);
    expect(r.estado).toBe("vencido");
  });

  it("Dado que superó los 10.000 km aunque el service sea reciente, Entonces está vencido", () => {
    const r = calcularProximoService({ km: 61_000, kmUltimoService: 50_000, fechaUltimoService: haceMeses(1) }, HOY);
    expect(r.estado).toBe("vencido");
  });
});

describe("Fechas en hora de Argentina", () => {
  it("a las 23:30 de Argentina (02:30 UTC del día siguiente) hoy sigue siendo el día argentino", () => {
    expect(hoyAR(new Date("2026-10-21T02:30:00Z"))).toBe("2026-10-20");
  });

  it("sumarDias cruza fin de mes", () => {
    expect(sumarDias("2026-10-31", 1)).toBe("2026-11-01");
    expect(sumarDias("2026-11-01", -1)).toBe("2026-10-31");
  });

  it("yaPaso compara día y hora en hora de Argentina", () => {
    const ahora = new Date("2026-10-20T13:00:00Z"); // 10:00 en Argentina
    expect(yaPaso("2026-10-19", "17:00", ahora)).toBe(true);
    expect(yaPaso("2026-10-20", "09:30", ahora)).toBe(true);
    expect(yaPaso("2026-10-20", "10:30", ahora)).toBe(false);
    expect(yaPaso("2026-10-21", "08:00", ahora)).toBe(false);
  });

  it("rangoDelDia va de 00:00 a 00:00 del día siguiente en -03:00", () => {
    const { desde, hasta } = rangoDelDia("2026-10-20");
    expect(desde.toISOString()).toBe("2026-10-20T03:00:00.000Z");
    expect(hasta.toISOString()).toBe("2026-10-21T03:00:00.000Z");
  });
});

describe("Patentes y horarios", () => {
  it("normaliza y reconoce los dos formatos argentinos", () => {
    expect(normalizarPatente(" ab 123-cd ")).toBe("AB123CD");
    expect(PATENTE_REGEX.test("AB123CD")).toBe(true);
    expect(PATENTE_REGEX.test("ABC123")).toBe(true);
    expect(PATENTE_REGEX.test("A1B2C3")).toBe(false);
  });

  it("los horarios de atención van cada 30 minutos de 08:00 a 17:30", () => {
    expect(HORARIOS[0]).toBe("08:00");
    expect(HORARIOS.at(-1)).toBe("17:30");
    expect(HORARIOS).toHaveLength(20);
  });
});
