import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../config/prisma", () => ({
  prisma: {
    usuario: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import app from "../app";
import { prisma } from "../config/prisma";
import { JWT_SECRET } from "../config/env";

describe("Seguridad y permisos - /api/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/auth/yo", () => {
    it("responde 401 cuando no se envía token (Público)", async () => {
      const res = await request(app).get("/api/auth/yo");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.usuario.findUnique).not.toHaveBeenCalled();
    });

    it("responde 401 cuando el header Authorization no tiene formato Bearer", async () => {
      const res = await request(app)
        .get("/api/auth/yo")
        .set("Authorization", "TokenSinBearer");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Falta el token" });
      expect(prisma.usuario.findUnique).not.toHaveBeenCalled();
    });

    it("responde 401 cuando el token tiene firma inválida o adulterada", async () => {
      const tokenAdulterado = jwt.sign(
        { id: 1, rol: "CLIENTE" },
        "otro-secreto-invalido",
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/api/auth/yo")
        .set("Authorization", `Bearer ${tokenAdulterado}`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Token inválido" });
      expect(prisma.usuario.findUnique).not.toHaveBeenCalled();
    });

    it("responde 401 cuando el token está expirado", async () => {
      const tokenExpirado = jwt.sign(
        { id: 1, rol: "CLIENTE" },
        JWT_SECRET,
        { expiresIn: "-1s" }
      );

      const res = await request(app)
        .get("/api/auth/yo")
        .set("Authorization", `Bearer ${tokenExpirado}`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Token expirado" });
      expect(prisma.usuario.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
    it("responde 401 con credenciales inválidas cuando el email no existe", async () => {
      vi.mocked(prisma.usuario.findUnique).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "inexistente@sanjose.test", password: "Password123" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Credenciales inválidas" });
      expect(prisma.usuario.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/auth/registro - escalada de privilegios", () => {
    it("Dado un visitante que manda rol ADMIN en el body, Cuando se registra, Entonces el usuario se crea igual como CLIENTE", async () => {
      // Dado
      vi.mocked(prisma.usuario.create).mockResolvedValueOnce({
        id: 20,
        nombre: "Intruso",
        email: "intruso@sanjose.test",
        rol: "CLIENTE",
        createdAt: new Date("2026-10-20T12:00:00Z"),
      } as never);

      // Cuando
      const res = await request(app).post("/api/auth/registro").send({
        nombre: "Intruso",
        email: "intruso@sanjose.test",
        password: "quieroSerAdmin",
        rol: "ADMIN",
      });

      // Entonces: se guardó con rol CLIENTE, sin importar lo que vino en el body
      expect(res.status).toBe(201);
      const llamada = vi.mocked(prisma.usuario.create).mock.calls[0][0];
      expect(llamada.data.rol).toBe("CLIENTE");
    });
  });
});
