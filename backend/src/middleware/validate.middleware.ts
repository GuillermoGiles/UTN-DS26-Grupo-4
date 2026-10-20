import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) return next(resultado.error);
    req.body = resultado.data;
    next();
  };

export const validateParams = (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.params);
    if (!resultado.success) return next(resultado.error);
    req.params = resultado.data as any;
    next();
  };

// En Express 5 req.query es un getter de solo lectura: se redefine la propiedad
// en la instancia para que el controller lea los valores ya validados y convertidos.
export const validateQuery = (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.query);
    if (!resultado.success) return next(resultado.error);
    Object.defineProperty(req, "query", { value: resultado.data, writable: true });
    next();
  };
