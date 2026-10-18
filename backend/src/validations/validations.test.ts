import { describe, it, expect } from "vitest";
import { servicioCreateSchema, idParamSchema } from "./servicio.validation";
import { clienteCreateSchema } from "./cliente.validation";
import { turnoCreateSchema } from "./turno.validation";

describe("Validaciones de dominio (Dado / Cuando / Entonces)", () => {
  describe("servicioCreateSchema", () => {
    const servicioBase = {
      nombre: "Lavado Completo",
      precio: 15000,
      desc: "Lavado exterior e interior",
      tipo: "lavadero" as const,
    };

    it("rechaza un servicio con precio negativo", () => {
      // Dado
      const entrada = { ...servicioBase, precio: -500 };

      // Cuando
      const resultado = servicioCreateSchema.safeParse(entrada);

      // Entonces
      expect(resultado.success).toBe(false);
      if (!resultado.success) {
        expect(resultado.error.issues[0].path).toEqual(["precio"]);
      }
    });

    it("recorta espacios en blanco del nombre del servicio", () => {
      // Dado
      const entrada = { ...servicioBase, nombre: "   Cambio de filtro   " };

      // Cuando
      const resultado = servicioCreateSchema.safeParse(entrada);

      // Entonces
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.nombre).toBe("Cambio de filtro");
      }
    });
  });

  describe("clienteCreateSchema", () => {
    it("normaliza la patente quitando espacios y pasándola a mayúsculas", () => {
      // Dado
      const cliente = {
        nombre: "Martín Gómez",
        vehiculo: "Renault Kangoo",
        patente: "  ae987xz  ",
        telefono: "2214005566",
      };

      // Cuando
      const resultado = clienteCreateSchema.safeParse(cliente);

      // Entonces
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.patente).toBe("AE987XZ");
      }
    });

    it("rechaza una patente de menos de 6 caracteres", () => {
      // Dado
      const clienteInvalido = {
        nombre: "Martín Gómez",
        vehiculo: "Renault Kangoo",
        patente: "AB12",
        telefono: "2214005566",
      };

      // Cuando
      const resultado = clienteCreateSchema.safeParse(clienteInvalido);

      // Entonces
      expect(resultado.success).toBe(false);
    });
  });

  describe("turnoCreateSchema e idParamSchema", () => {
    it("convierte el parámetro id numérico en string a number", () => {
      // Dado
      const params = { id: "42" };

      // Cuando
      const resultado = idParamSchema.safeParse(params);

      // Entonces
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.id).toBe(42);
      }
    });

    it("rechaza un turno si clienteId o servicioId no son enteros positivos", () => {
      // Dado
      const turnoInvalido = {
        fecha: "2026-10-20",
        hora: "09:00",
        clienteId: 0,
        servicioId: -1,
      };

      // Cuando
      const resultado = turnoCreateSchema.safeParse(turnoInvalido);

      // Entonces
      expect(resultado.success).toBe(false);
    });
  });
});
