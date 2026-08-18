import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  // Errores conocidos de Prisma → HTTP status codes correctos
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025": // Record not found
        return res.status(404).json({ error: "Registro no encontrado" });
      case "P2002": // Unique constraint violation
        return res.status(409).json({ error: "Ya existe un registro con esos datos" });
    }
  }

  res.status(500).json({ error: "Error interno del servidor" });
}
