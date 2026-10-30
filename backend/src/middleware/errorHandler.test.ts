import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { Prisma } from "@prisma/client";
import { errorHandler } from "./errorHandler";
import { esErrorDeRelacion } from "../utils/prismaErrors";

// Errores tal como los arma Prisma 7 con el adapter de pg
const errorPrisma = (message: string, code: string) =>
  new Prisma.PrismaClientKnownRequestError(message, { code, clientVersion: "7.9.1" });

// Lo que llega desde Neon al borrar un cliente con turnos (copiado de los logs de Render)
const restrictDeNeon = errorPrisma(
  'Database error. Code: `23001`. Message: `update or delete on table "Cliente" violates RESTRICT setting of foreign key constraint "Turno_clienteId_fkey" on table "Turno"`',
  "P2010",
);

describe("Errores de relación entre registros (Dado / Cuando / Entonces)", () => {
  it("Dado un P2003 (Postgres local) o un 23001 (Neon), Entonces los dos se reconocen como error de relación", () => {
    expect(esErrorDeRelacion(errorPrisma("Foreign key constraint violated", "P2003"))).toBe(true);
    expect(esErrorDeRelacion(restrictDeNeon)).toBe(true);
    expect(esErrorDeRelacion(errorPrisma("Record not found", "P2025"))).toBe(false);
    expect(esErrorDeRelacion(new Error("23001"))).toBe(false);
  });

  it("Dado el error 23001 de Neon, Cuando llega al errorHandler, Entonces responde 409 y no 500", async () => {
    const app = express();
    app.delete("/x", () => { throw restrictDeNeon; });
    app.use(errorHandler);
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await request(app).delete("/x");

    expect(res.status).toBe(409);
  });

  it("Dado un body con JSON mal formado, Cuando llega a la API, Entonces responde 400 y no 500", async () => {
    const app = express();
    app.use(express.json());
    app.post("/x", (_req, res) => { res.sendStatus(201); });
    app.use(errorHandler);

    const res = await request(app).post("/x").set("Content-Type", "application/json").send("{nombre: sin comillas}");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("El cuerpo del pedido no es un JSON válido");
  });
});
