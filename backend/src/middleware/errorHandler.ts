import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
}
