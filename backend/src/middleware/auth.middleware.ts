import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Rol } from "@prisma/client";
import { JWT_SECRET } from "../config/env";

export interface PayloadToken {
  id: number;
  rol: Rol;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Falta el token" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as PayloadToken;
    req.usuario = { id: payload.id, rol: payload.rol };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
}

export function authorize(...roles: Rol[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: "No tenés permiso para esta operación" });
    }
    next();
  };
}
