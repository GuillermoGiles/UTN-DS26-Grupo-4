import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../config/prisma", () => ({
  prisma: {
    servicio: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import app from "../app";
import { prisma } from "../config/prisma";
import { JWT_SECRET } from "../config/env";

const tokenCliente = jwt.sign({ id: 3, rol: "CLIENTE" }, JWT_SECRET, { expiresIn: "1h" });
const tokenEmpleado = jwt.sign({ id: 2, rol: "EMPLEADO" }, JWT_SECRET, { expiresIn: "1h" });
const tokenAdmin = jwt.sign({ id: 1, rol: "ADMIN" }, JWT_SECRET, { expiresIn: "1h" });
const tokenAdulterado = jwt.sign({ id: 1, rol: "ADMIN" }, "secreto-incorrecto", { expiresIn: "1h" });

const servicioValido = {
  nombre: "Lavado Completo",
  precio: 15000,
  desc: "Lavado exterior e interior",
  tipo: "lavadero",
};

describe("Seguridad y permisos - /api/servicios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/servicios", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app)
        .post("/api/servicios")
        .send(servicioValido);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.servicio.create).not.toHaveBeenCalled();
    });

    it("responde 401 con token adulterado", async () => {
      const res = await request(app)
        .post("/api/servicios")
        .set("Authorization", `Bearer ${tokenAdulterado}`)
        .send(servicioValido);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Token inválido" });
      expect(prisma.servicio.create).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .post("/api/servicios")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send(servicioValido);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.servicio.create).not.toHaveBeenCalled();
    });

    it("responde 403 con rol EMPLEADO", async () => {
      const res = await request(app)
        .post("/api/servicios")
        .set("Authorization", `Bearer ${tokenEmpleado}`)
        .send(servicioValido);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.servicio.create).not.toHaveBeenCalled();
    });

    it("responde 400 (no 403) con rol ADMIN y body inválido", async () => {
      const res = await request(app)
        .post("/api/servicios")
        .set("Authorization", `Bearer ${tokenAdmin}`)
        .send({ ...servicioValido, precio: -100 });

      expect(res.status).toBe(400);
      expect(res.body.detalles).toContainEqual({
        campo: "precio",
        mensaje: "El precio debe ser mayor a 0",
      });
      expect(prisma.servicio.create).not.toHaveBeenCalled();
    });
  });

  describe("PUT /api/servicios/:id", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app)
        .put("/api/servicios/1")
        .send({ precio: 18000 });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.servicio.update).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .put("/api/servicios/1")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({ precio: 18000 });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.servicio.update).not.toHaveBeenCalled();
    });

    it("responde 403 con rol EMPLEADO", async () => {
      const res = await request(app)
        .put("/api/servicios/1")
        .set("Authorization", `Bearer ${tokenEmpleado}`)
        .send({ precio: 18000 });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.servicio.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/servicios/:id", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app).delete("/api/servicios/1");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.servicio.delete).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .delete("/api/servicios/1")
        .set("Authorization", `Bearer ${tokenCliente}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.servicio.delete).not.toHaveBeenCalled();
    });

    it("responde 403 con rol EMPLEADO", async () => {
      const res = await request(app)
        .delete("/api/servicios/1")
        .set("Authorization", `Bearer ${tokenEmpleado}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.servicio.delete).not.toHaveBeenCalled();
    });
  });
});
