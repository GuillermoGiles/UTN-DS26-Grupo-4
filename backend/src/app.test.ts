import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app";

// Test de humo de la infraestructura: app se puede importar sin abrir un puerto
// y supertest le pega a Express completo. No toca la base de datos.
describe("app", () => {
  it("GET / responde 200 con el mensaje de la API", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mensaje: "API SGI San José 🐳" });
  });

  it("GET /api/no-existe responde 404 en JSON", async () => {
    const res = await request(app).get("/api/no-existe");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Ruta no encontrada" });
  });
});
