import { describe, it, expect, vi } from "vitest";

vi.mock("../config/prisma", () => ({ prisma: {} }));
import { descontarPorServicio } from "./insumo.service";

/** Transacción de mentira con una receta fija: alcanza para probar la regla sin base. */
function txConReceta(receta: { insumoId: number; cantidad: number; insumo: { stock: number } }[]) {
  return {
    servicioInsumo: { findMany: vi.fn().mockResolvedValue(receta) },
    insumo: { update: vi.fn() },
    movimientoStock: { create: vi.fn() },
  };
}

describe("Descuento automático de insumos al terminar un servicio", () => {
  it("Dado un cambio de aceite con 4 L de aceite y 1 filtro, Cuando se completa, Entonces descuenta esas cantidades y registra los movimientos", async () => {
    const tx = txConReceta([
      { insumoId: 1, cantidad: 4, insumo: { stock: 40 } },
      { insumoId: 2, cantidad: 1, insumo: { stock: 6 } },
    ]);

    await descontarPorServicio(tx as never, 1, "Turno #5");

    expect(tx.insumo.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { stock: { decrement: 4 } } });
    expect(tx.insumo.update).toHaveBeenCalledWith({ where: { id: 2 }, data: { stock: { decrement: 1 } } });
    expect(tx.movimientoStock.create).toHaveBeenCalledWith({ data: { insumoId: 1, cantidad: -4, motivo: "Turno #5" } });
  });

  it("Dado que no alcanza el stock, Cuando se completa, Entonces descuenta lo que hay (queda en 0) sin frenar el trabajo", async () => {
    const tx = txConReceta([{ insumoId: 3, cantidad: 2, insumo: { stock: 1 } }]);

    await descontarPorServicio(tx as never, 1, "Turno #9");

    expect(tx.insumo.update).toHaveBeenCalledWith({ where: { id: 3 }, data: { stock: { decrement: 1 } } });
  });

  it("Dado un insumo ya en 0, Entonces no genera un movimiento vacío", async () => {
    const tx = txConReceta([{ insumoId: 3, cantidad: 2, insumo: { stock: 0 } }]);

    await descontarPorServicio(tx as never, 1, "Turno #10");

    expect(tx.insumo.update).not.toHaveBeenCalled();
    expect(tx.movimientoStock.create).not.toHaveBeenCalled();
  });
});
