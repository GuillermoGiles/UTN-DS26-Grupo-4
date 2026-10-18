import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../config/prisma", () => ({
  prisma: {
    cliente: {
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

const clienteValido = {
  nombre: "Juan Pérez",
  vehiculo: "Toyota Corolla",
  patente: "AB123CD",
  telefono: "2215551234",
};

describe("Seguridad y permisos - /api/clientes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/clientes", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app).get("/api/clientes");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.cliente.findMany).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .get("/api/clientes")
        .set("Authorization", `Bearer ${tokenCliente}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.cliente.findMany).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/clientes/:id", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app).get("/api/clientes/1");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.cliente.findUnique).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .get("/api/clientes/1")
        .set("Authorization", `Bearer ${tokenCliente}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.cliente.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/clientes", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app)
        .post("/api/clientes")
        .send(clienteValido);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.cliente.create).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .post("/api/clientes")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send(clienteValido);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.cliente.create).not.toHaveBeenCalled();
    });
  });

  describe("PUT /api/clientes/:id", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app)
        .put("/api/clientes/1")
        .send({ telefono: "2214449999" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.cliente.update).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .put("/api/clientes/1")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({ telefono: "2214449999" });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.cliente.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/clientes/:id", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app).delete("/api/clientes/1");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.cliente.delete).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .delete("/api/clientes/1")
        .set("Authorization", `Bearer ${tokenCliente}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.cliente.delete).not.toHaveBeenCalled();
    });

    it("responde 403 con rol EMPLEADO", async () => {
      const res = await request(app)
        .delete("/api/clientes/1")
        .set("Authorization", `Bearer ${tokenEmpleado}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.cliente.delete).not.toHaveBeenCalled();
    });
  });
});
