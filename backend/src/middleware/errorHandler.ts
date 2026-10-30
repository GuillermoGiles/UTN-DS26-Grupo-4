import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { esErrorDeRelacion } from "../utils/prismaErrors";
import { AppError } from "../errors/AppError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // JSON mal formado en el body (express.json no lo pudo leer) → es culpa del pedido, no del servidor
  if (err instanceof SyntaxError && (err as { type?: string }).type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo del pedido no es un JSON válido" });
  }

  // Reglas de negocio que los services validan contra la base
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: err.issues.map((i) => ({
        campo: i.path.join("."),
        mensaje: i.message,
      })),
    });
  }

  // Registro relacionado con otros (P2003, o 23001 que Neon devuelve para onDelete: Restrict)
  if (esErrorDeRelacion(err)) {
    return res.status(409).json({ error: "Hay registros relacionados o la clave foránea no existe" });
  }

  // Errores conocidos de Prisma → HTTP status codes correctos
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un registro con esos datos" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
  }

  console.error("[ERROR]", err);
  return res.status(500).json({ error: "Error interno del servidor" });
}
