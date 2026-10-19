import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticate, authorize } from "./auth.middleware";
import { JWT_SECRET } from "../config/env";

function crearMocks(req: Partial<Request> = {}) {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req: req as Request, res, next };
}

describe("Middlewares de autenticación y autorización", () => {
  describe("authorize", () => {
    it("Dado un usuario con rol CLIENTE, Cuando la ruta exige ADMIN, Entonces responde 403 y no llama a next", () => {
      // Dado
      const { req, res, next } = crearMocks({
        usuario: { id: 3, rol: "CLIENTE" },
      });

      // Cuando
      authorize("ADMIN")(req, res, next);

      // Entonces
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "No tenés permiso para esta operación",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("Dado un usuario con rol EMPLEADO, Cuando la ruta permite ADMIN o EMPLEADO, Entonces llama a next", () => {
      // Dado
      const { req, res, next } = crearMocks({
        usuario: { id: 2, rol: "EMPLEADO" },
      });

      // Cuando
      authorize("ADMIN", "EMPLEADO")(req, res, next);

      // Entonces
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("authenticate", () => {
    it("Dado un token válido, Cuando pasa por authenticate, Entonces carga req.usuario y llama a next", () => {
      // Dado
      const token = jwt.sign({ id: 7, rol: "CLIENTE" }, JWT_SECRET, {
        expiresIn: "1h",
      });
      const { req, res, next } = crearMocks({
        headers: { authorization: `Bearer ${token}` },
      });

      // Cuando
      authenticate(req, res, next);

      // Entonces
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.usuario).toEqual({ id: 7, rol: "CLIENTE" });
    });

    it("Dado un token vencido, Cuando pasa por authenticate, Entonces responde 401 Token expirado", () => {
      // Dado
      const tokenVencido = jwt.sign({ id: 7, rol: "CLIENTE" }, JWT_SECRET, {
        expiresIn: "-1s",
      });
      const { req, res, next } = crearMocks({
        headers: { authorization: `Bearer ${tokenVencido}` },
      });

      // Cuando
      authenticate(req, res, next);

      // Entonces
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token expirado" });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
