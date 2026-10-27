import { describe, it, expect } from "vitest";
import { servicioCreateSchema, idParamSchema } from "./servicio.validation";
import { vehiculoCreateSchema } from "./vehiculo.validation";
import { clienteCreateSchema } from "./cliente.validation";
import { insumoCreateSchema, recetaSchema } from "./insumo.validation";
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

  describe("vehiculoCreateSchema (patente)", () => {
    const vehiculoBase = { marca: "Renault", modelo: "Kangoo" };

    it("normaliza la patente quitando espacios y guiones y pasándola a mayúsculas", () => {
      // Dado
      const vehiculo = { ...vehiculoBase, patente: "  ae 987-xz  " };

      // Cuando
      const resultado = vehiculoCreateSchema.safeParse(vehiculo);

      // Entonces
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.patente).toBe("AE987XZ");
      }
    });

    it("rechaza una patente de menos de 6 caracteres", () => {
      // Dado
      const vehiculoInvalido = { ...vehiculoBase, patente: "AB12" };

      // Cuando
      const resultado = vehiculoCreateSchema.safeParse(vehiculoInvalido);

      // Entonces
      expect(resultado.success).toBe(false);
    });

    it("rechaza una patente con formato que no es argentino", () => {
      // Dado: 6 o más caracteres, pero ni AAA123 ni AA123BB
      const resultado = vehiculoCreateSchema.safeParse({ ...vehiculoBase, patente: "1234AB" });

      // Entonces
      expect(resultado.success).toBe(false);
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toBe("La patente debe ser AAA123 o AA123BB");
      }
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

    it("rechaza un turno sin servicios o con servicios repetidos", () => {
      // Dado
      const base = { fecha: "2030-10-21", hora: "09:00", vehiculoId: 4 };

      // Cuando / Entonces
      expect(turnoCreateSchema.safeParse({ ...base, servicioIds: [] }).success).toBe(false);
      expect(turnoCreateSchema.safeParse({ ...base, servicioIds: [2, 2] }).success).toBe(false);
      expect(turnoCreateSchema.safeParse({ ...base, servicioIds: [2, 3] }).success).toBe(true);
    });

    it("rechaza un turno si clienteId o servicioIds no son enteros positivos", () => {
      // Dado
      const turnoInvalido = {
        fecha: "2026-10-20",
        hora: "09:00",
        clienteId: 0,
        servicioIds: [-1],
      };

      // Cuando
      const resultado = turnoCreateSchema.safeParse(turnoInvalido);

      // Entonces
      expect(resultado.success).toBe(false);
    });
  });

  describe("DNI e insumos", () => {
    it("normaliza el DNI quitando puntos y rechaza los que no tienen 7 u 8 números", () => {
      const base = { nombre: "Ana", telefono: "221-555-1234" };
      const ok = clienteCreateSchema.safeParse({ ...base, dni: "28.456.921" });
      expect(ok.success && ok.data.dni).toBe("28456921");
      expect(clienteCreateSchema.safeParse({ ...base, dni: "123" }).success).toBe(false);
    });

    it("rechaza un insumo con stock negativo o unidad desconocida", () => {
      expect(insumoCreateSchema.safeParse({ nombre: "Aceite", unidad: "litros", stock: -1, stockMinimo: 0 }).success).toBe(false);
      expect(insumoCreateSchema.safeParse({ nombre: "Aceite", unidad: "kilos", stock: 1, stockMinimo: 0 }).success).toBe(false);
    });

    it("rechaza una receta con el mismo insumo dos veces", () => {
      const r = recetaSchema.safeParse({ insumos: [{ insumoId: 1, cantidad: 1 }, { insumoId: 1, cantidad: 2 }] });
      expect(r.success).toBe(false);
    });
  });
});
