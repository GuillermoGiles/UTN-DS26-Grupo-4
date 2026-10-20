import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../config/prisma", () => ({
  prisma: {
    turno: {
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
const tokenAdulterado = jwt.sign({ id: 3, rol: "CLIENTE" }, "secreto-incorrecto", { expiresIn: "1h" });

const turnoValido = {
  fecha: "2030-10-20",
  hora: "10:00",
  clienteId: 1,
  servicioId: 1,
};

describe("Seguridad y permisos - /api/turnos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/turnos", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app).get("/api/turnos");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.turno.findMany).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .get("/api/turnos")
        .set("Authorization", `Bearer ${tokenCliente}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.turno.findMany).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/turnos/:id", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app).get("/api/turnos/1");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.turno.findUnique).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .get("/api/turnos/1")
        .set("Authorization", `Bearer ${tokenCliente}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.turno.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/turnos", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app)
        .post("/api/turnos")
        .send(turnoValido);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.turno.create).not.toHaveBeenCalled();
    });

    it("responde 401 con token adulterado", async () => {
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenAdulterado}`)
        .send(turnoValido);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Token inválido" });
      expect(prisma.turno.create).not.toHaveBeenCalled();
    });
  });

  describe("PUT /api/turnos/:id", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app)
        .put("/api/turnos/1")
        .send({ hora: "11:00" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.turno.update).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .put("/api/turnos/1")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({ hora: "11:00" });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.turno.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/turnos/:id", () => {
    it("responde 401 sin token (Público)", async () => {
      const res = await request(app).delete("/api/turnos/1");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.turno.delete).not.toHaveBeenCalled();
    });

    it("responde 403 con rol CLIENTE", async () => {
      const res = await request(app)
        .delete("/api/turnos/1")
        .set("Authorization", `Bearer ${tokenCliente}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
      expect(prisma.turno.delete).not.toHaveBeenCalled();
    });
  });
});
