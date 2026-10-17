// ⚠️ NECESITA BASE DE DATOS ⚠️
// Estos tests le pegan a PostgreSQL de verdad: necesitan `docker compose up -d db`
// con las migraciones y el seed cargados. Con Docker apagado fallan con
// "Can't reach database server"; el resto de la suite sigue verde.
// Para correr solo los tests sin DB: `npm run test:sin-db`.
// Convención: todo test que toque la DB va en un archivo *.db.test.ts.
import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../config/prisma";

afterAll(() => prisma.$disconnect()); // cerrar la conexión al terminar

describe("GET /api/servicios (con DB)", () => {
  it("responde 200 con el catálogo público del seed", async () => {
    const res = await request(app).get("/api/servicios");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
