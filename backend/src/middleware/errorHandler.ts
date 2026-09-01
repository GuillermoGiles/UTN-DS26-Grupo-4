import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: err.issues.map((i) => ({
        campo: i.path.join("."),
        mensaje: i.message,
      })),
    });
  }

  // Errores conocidos de Prisma → HTTP status codes correctos
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un registro con esos datos" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ error: "Hay registros relacionados o la clave foránea no existe" });
    }
  }

  console.error("[ERROR]", err);
  return res.status(500).json({ error: "Error interno del servidor" });
}
