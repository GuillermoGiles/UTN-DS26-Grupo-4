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
